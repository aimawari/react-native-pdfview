import React, {Component} from 'react';
import {
  requireNativeComponent,
  Image,
  View,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';

import PdfView from './src/PdfView';
import {Orientation} from './src/constant';

const SHA256 = require('crypto-js/sha256');

export default class Pdf extends Component {
  static defaultProps = {
    password: '',
    page: 1,
    horizontal: false,
    zoom: 1,
    minZoom: 1,
    maxZoom: 3,
    spacing: 10,

    enablePaging: false,

    onLoadComplete: (numberOfPages, path) => {},
    onPageChanged: (page, numberOfPages) => {},
    onError: error => {},
    onPageSingleTap: page => {},
    onZoomChanged: zoom => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      path: '',
      isLoaded: false,
      orientation: Orientation.PORTRAIT,
    };

    this.lastRNBFTask = null;
  }

  componentDidMount() {
    this._loadSource(this.props.source);
    this._checkOrientation();

    // Detect orientation changed
    Dimensions.addEventListener('change', () => {
      this._checkOrientation();
      console.log('checkorientation');
    });
  }

  componentDidUpdate(prevProps) {
    const nextSource = Image.resolveAssetSource(this.props.source);
    const curSource = Image.resolveAssetSource(prevProps.source);

    if (nextSource.uri !== curSource.uri) {
      // if has download task, then cancel it.
      if (this.lastRNBFTask) {
        this.lastRNBFTask.cancel(err => {
          this._loadSource(this.props.source);
        });
        this.lastRNBFTask = null;
      } else {
        this._loadSource(this.props.source);
      }
    }
  }

  componentWillUnmount() {
    if (this.lastRNBFTask) {
      this.lastRNBFTask.cancel(err => {});
      this.lastRNBFTask = null;
    }

    Dimensions.removeEventListener('change');
  }

  _checkOrientation = () => {
    let orientation =
      Dimensions.get('window').width < Dimensions.get('window').height
        ? Orientation.PORTRAIT
        : Orientation.LANDSCAPE;

    this.setState({
      orientation,
    });
  };

  _loadSource = async newSource => {
    const source = Image.resolveAssetSource(newSource) || {};

    let uri = source.uri || '';

    this.setState({isLoaded: false, path: ''});

    const cacheFile = `${RNFetchBlob.fs.dirs.CacheDir}/${SHA256(uri)}.pdf`;

    if (source.cache) {
      try {
        const stats = await RNFetchBlob.fs.stat(cacheFile);

        if (
          !Boolean(source.expiration) ||
          source.expiration * 1000 + stats.lastModified > new Date().getTime()
        ) {
          this.setState({path: cacheFile, isLoaded: true});
        } else {
          this._prepareFile(source);
        }
      } catch (error) {
        this._prepareFile(source);
      }
    } else {
      this._prepareFile(source);
    }
  };

  _prepareFile = async source => {
    try {
      if (source.uri) {
        let uri = source.uri || '';

        const isNetwork = !!(uri && uri.match(/^https?:\/\//));
        const isAsset = !!(uri && uri.match(/^bundle-assets:\/\//));
        const isBase64 = !!(uri && uri.match(/^data:application\/pdf;base64/));

        const cacheFile = `${RNFetchBlob.fs.dirs.CacheDir}/${SHA256(uri)}.pdf`;

        this._unlinkFile(cacheFile);

        if (isNetwork) {
          this._downloadFile(source, cacheFile);
        } else if (isAsset) {
          try {
            await RNFetchBlob.fs.cp(uri, cacheFile);
            this.setState({path: cacheFile, isLoaded: true});
          } catch (error) {
            this._unlinkFile(cacheFile);
            this._onError(error);
          }
        } else if (isBase64) {
          let data = uri.replace(/data:application\/pdf;base64,/i, '');

          try {
            await RNFetchBlob.fs.writeFile(cacheFile, data, 'base64');
            this.setState({path: cacheFile, isLoaded: true});
          } catch (error) {
            this._unlinkFile(cacheFile);
            this._onError(error);
          }
        } else {
          this.setState({
            path: uri.replace(/file:\/\//i, ''),
            isLoaded: true,
          });
        }
      } else {
        this._onError(new Error('no pdf source!'));
      }
    } catch (e) {
      this._onError(e);
    }
  };

  _downloadFile = async (source, cacheFile) => {
    if (this.lastRNBFTask) {
      this.lastRNBFTask.cancel(err => {});
      this.lastRNBFTask = null;
    }

    const tempCacheFile = cacheFile + '.tmp';
    this._unlinkFile(tempCacheFile);

    this.lastRNBFTask = RNFetchBlob.config({
      // response data will be saved to this path if it has access right.
      path: tempCacheFile,
      trusty: true,
    }).fetch(
      source.method ? source.method : 'GET',
      source.uri,
      source.headers ? source.headers : {},
      source.body ? source.body : '',
    );
    try {
      let res = await this.lastRNBFTask;

      this.lastRNBFTask = null;

      if (
        res &&
        res.respInfo &&
        res.respInfo.headers &&
        !res.respInfo.headers['Content-Encoding'] &&
        !res.respInfo.headers['Transfer-Encoding'] &&
        res.respInfo.headers['Content-Length']
      ) {
        const expectedContentLength = res.respInfo.headers['Content-Length'];
        let actualContentLength;

        try {
          const fileStats = await RNFetchBlob.fs.stat(res.path());

          if (!fileStats || !fileStats.size) {
            throw new Error('FileNotFound:' + url);
          }

          actualContentLength = fileStats.size;
        } catch (error) {
          throw new Error('DownloadFailed:' + url);
        }

        if (expectedContentLength != actualContentLength) {
          throw new Error('DownloadFailed:' + url);
        }
      }

      this._unlinkFile(cacheFile);
      try {
        await RNFetchBlob.fs.cp(tempCacheFile, cacheFile);

        this.setState({path: cacheFile, isLoaded: true});
        this._unlinkFile(tempCacheFile);
      } catch (error) {
        throw error;
      }
    } catch (error) {
      this._unlinkFile(tempCacheFile);
      this._unlinkFile(cacheFile);
      this._onError(error);
    }
  };

  _unlinkFile = async file => {
    try {
      await RNFetchBlob.fs.unlink(file);
    } catch (e) {}
  };

  setNativeProps = nativeProps => {
    if (this._root) {
      this._root.setNativeProps(nativeProps);
    }
  };

  setPage(pageNumber) {
    if (pageNumber === null || isNaN(pageNumber)) {
      throw new Error('Specified pageNumber is not a number');
    }
    this.setNativeProps({
      page: pageNumber,
    });
  }

  _onChange = event => {
    let message = event.nativeEvent.message.split('|');
    if (message.length > 0) {
      if (message.length > 5) {
        message[4] = message.splice(4).join('|');
      }

      switch (message[0]) {
        case 'loadComplete':
          this.props.onLoadComplete &&
            this.props.onLoadComplete(
              Number(message[1]),
              this.state.path,
              {
                width: Number(message[2]),
                height: Number(message[3]),
              },
              message[4] && JSON.parse(message[4]),
            );
          break;
        case 'pageChanged':
          this.props.onPageChanged &&
            this.props.onPageChanged(Number(message[1]), Number(message[2]));
          break;
        case 'pageSingleTap':
          this.props.onPageSingleTap && this.props.onPageSingleTap(message[1]);
          break;
        case 'zoomChanged':
          this.props.onZoomChanged && this.props.onZoomChanged(message[1]);
          break;
        case 'error':
          this._onError(new Error(message[1]));
          break;
      }
    }
  };

  _onError = error => {
    this.props.onError && this.props.onError(error);
  };

  render() {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return (
        <View style={[this.props.style, {overflow: 'hidden'}]}>
          {!this.state.isLoaded ? (
            <View style={styles.container}>
              {this.props.activityIndicator ? (
                this.props.activityIndicator
              ) : (
                <View>
                  <ActivityIndicator style={styles.container} />
                </View>
              )}
            </View>
          ) : Platform.OS === 'android' ? (
            <PdfViewAndroid
              ref={component => (this._root = component)}
              {...this.props}
              style={[styles.container, this.props.style]}
              path={this.state.path}
              onChange={this._onChange}
              scale={this.props.zoom}
              minScale={this.props.minScale}
              maxScale={this.props.maxZoom}
              onScaleChange={this.props.onZoomChange}
              orientation={this.state.orientation}
            />
          ) : (
            <PdfView
              {...this.props}
              style={[styles.container, this.props.style]}
              path={this.state.path}
              onLoadComplete={this.props.onLoadComplete}
              onPageChanged={this.props.onPageChanged}
              onError={this._onError}
              onPageSingleTap={this.props.onPageSingleTap}
              onZoomChanged={this.props.onZoomChanged}
              orientation={this.state.orientation}
            />
          )}
        </View>
      );
    } else {
      return null;
    }
  }
}

if (Platform.OS === 'android') {
  var PdfViewAndroid = requireNativeComponent('PdfUIViewAndroid', Pdf, {
    nativeOnly: {path: true, onChange: true},
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
