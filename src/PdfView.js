import React, {Component} from 'react';
import {View, StyleSheet, NativeModules, FlatList} from 'react-native';

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';

import PdfPage from './PdfPage';

import {Orientation} from './constant';

const PdfParser = NativeModules.PdfParser;

export default class PdfView extends Component {
  static defaultProps = {
    path: '',
    password: '',
    zoom: 1,
    minZoom: 1,
    maxZoom: 2,
    style: {},
    horizontal: false,
    page: 1,
    currentPage: -1,
    enablePaging: false,
    onPageSingleTap: page => {},
    onZoomChanged: zoom => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      pdfLoaded: false,
      numberOfPages: 0,
      page: -1,
      currentPage: -1,
      pageAspectRatio: 0.5,
      containerSize: {width: 0, height: 0},
      zoom: this.props.zoom,
      scrollEnabled: true,
    };

    this._flatList = React.createRef();
    this._tapmillis = 0;
  }

  componentDidMount() {
    this._loadPdfParser();
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path) {
      this._loadPdfParser();
    }

    if (
      this.props.horizontal !== prevProps.horizontal ||
      this.props.page !== prevProps.page
    ) {
      this.setState({currentPage: this.props.page});

      this._scrollToPage(
        this.state.currentPage > this.state.numberOfPages
          ? this.state.numberOfPages
          : this.state.currentPage,
      );
    }

    // scroll to current page when screen oriented
    if (this.props.orientation != prevProps.orientation) {
      this._scrollToPage(
        this.state.currentPage > this.state.numberOfPages
          ? this.state.numberOfPages
          : this.state.currentPage,
      );
    }
  }

  async _loadPdfParser() {
    try {
      let pdfRefsInfo = await PdfParser.load(
        this.props.path,
        this.props.password,
      );
      const {numberOfPages, width, height} = pdfRefsInfo;
      const pageAspectRatio = height === 0 ? 1 : width / height;
      const currentPage =
        this.props.page > numberOfPages ? numberOfPages : this.props.page;

      this.setState(
        {
          pdfLoaded: true,
          currentPage,
          pageAspectRatio,
          numberOfPages,
        },
        () => this._scrollToPage(currentPage),
      );
      if (this.props.onLoadComplete) {
        this.props.onLoadComplete(numberOfPages, this.props.path, {
          width,
          height,
        });
      }
    } catch (error) {
      console.log(error);
      this.props.onError(error);
    }
  }

  _scrollToPage = page => {
    setTimeout(() => {
      if (this._flatList) {
        let index = page < 1 ? 0 : page - 1;
        this._flatList.current.scrollToIndex({
          animated: true,
          index: index,
        });
      }
    }, 150);
  };

  _keyExtractor = (item, index) => `pdf-page-content-${index + 1}`;

  _getPageStyle = () => {
    let portraitWidth =
      this.props.orientation === Orientation.PORTRAIT
        ? this.state.containerSize.width
        : this.state.containerSize.height;

    let portraitHeight =
      this.props.orientation === Orientation.PORTRAIT
        ? this.state.containerSize.height
        : this.state.containerSize.width;

    if (
      portraitWidth / this.state.containerSize.height <
      this.state.pageAspectRatio
    ) {
      return {
        width: portraitWidth * this.state.zoom,
        height:
          portraitWidth * (1 / this.state.pageAspectRatio) * this.state.zoom,
      };
    } else {
      return {
        width: portraitHeight * this.state.pageAspectRatio * this.state.zoom,
        height: portraitHeight * this.state.zoom,
      };
    }
  };

  _onItemSingleTap = index => {
    this.props.onPageSingleTap(index + 1);
  };

  _renderItem = ({item, index}) => {
    return (
      <View
        style={{
          width: this.props.enablePaging
            ? this.props.orientation === Orientation.PORTRAIT
              ? this.state.containerSize.width
              : this.state.containerSize.height
            : null,
          height: this.props.enablePaging
            ? this.props.orientation === Orientation.PORTRAIT
              ? this.state.containerSize.height
              : this.state.containerSize.width
            : null,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onStartShouldSetResponder={() => true}
        onResponderStart={evt => {
          this._tapXY = {
            x: evt.nativeEvent.locationX,
            y: evt.nativeEvent.locationY,
          };
          this._tapmillis = Date.now();
        }}
        onResponderRelease={evt => {
          if (
            this._tapmillis + 350 >= Date.now() &&
            this._tapXY.x === evt.nativeEvent.locationX &&
            this._tapXY.y === evt.nativeEvent.locationY
          ) {
            this._onItemSingleTap(index);
            this._tapmillis = 0;
          } else {
            this._tapmillis = 0;
          }
        }}>
        <PdfPage
          accessible={false}
          key={item.id}
          page={item.key + 1}
          width={this._getPageStyle().width}
          height={this._getPageStyle().height}
        />
      </View>
    );
  };

  // on Page Change handle
  _onViewableItemsChanged = viewableInfo => {
    for (let i = 0; i < viewableInfo.viewableItems.length; i++) {
      this._onPageChanged(
        viewableInfo.viewableItems[i].index + 1,
        this.state.numberOfPages,
      );
      if (
        viewableInfo.viewableItems.length +
          viewableInfo.viewableItems[0].index <
        this.state.numberOfPages
      )
        break;
    }
  };

  _onPageChanged = (page, numberOfPages) => {
    if (this.props.onPageChanged && this.state.currentPage !== page) {
      this.props.onPageChanged(page, numberOfPages);
      this.setState({page: page, currentPage: page});
    }
  };

  _snapTo = () => {
    if (this.props.enablePaging) {
      if (
        (this.props.horizontal === true &&
          this.props.orientation === Orientation.PORTRAIT) ||
        (this.props.horizontal === false &&
          this.props.orientation === Orientation.LANDSCAPE)
      ) {
        return this.state.containerSize.width;
      } else {
        return this.state.containerSize.height;
      }
    }
    return null;
  };

  _getItemLayout = (data, index) => {
    let itemLength;
    if (this.props.enablePaging) {
      if (
        (this.props.horizontal === true &&
          this.props.orientation === Orientation.PORTRAIT) ||
        (this.props.horizontal === false &&
          this.props.orientation === Orientation.LANDSCAPE)
      ) {
        itemLength = this.state.containerSize.width;
      } else {
        itemLength = this.state.containerSize.height;
      }
    } else {
      itemLength = this._getPageStyle().width;
    }

    return {
      length: itemLength,
      offset: itemLength * index,
      index,
    };
  };

  _renderList = () => {
    let data = [];
    for (let i = 0; i < this.state.numberOfPages; i++) {
      data[i] = {key: i};
    }

    return (
      <ReactNativeZoomableView
        maxZoom={this.props.maxZoom}
        minZoom={this.props.minZoom}
        zoomStep={0.5}
        initialZoom={this.props.zoom}
        bindToBorders={true}
        onZoomBefore={(event, gestureState, zoomableViewEventObject) => {
          if (
            zoomableViewEventObject.zoomLevel !== 1 &&
            this.state.scrollEnabled === true
          ) {
            this.setState({scrollEnabled: false});
          } else if (
            zoomableViewEventObject.zoomLevel === 1 &&
            this.state.scrollEnabled === false
          ) {
            this.setState({scrollEnabled: true});
          }
        }}
        onZoomAfter={this.props.onZoomChanged}>
        <FlatList
          ref={this._flatList}
          scrollEnabled={this.state.scrollEnabled}
          horizontal={this.props.horizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={[
            {
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          data={data}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          maxToRenderPerBatch={1}
          onViewableItemsChanged={this._onViewableItemsChanged}
          viewabilityConfig={{
            minimumViewTime: 500,
            itemVisiblePercentThreshold: 10,
            waitForInteraction: false,
          }}
          // Snap to make paging
          snapToInterval={this._snapTo()}
          decelerationRate="fast"
          getItemLayout={this._getItemLayout}
        />
      </ReactNativeZoomableView>
    );
  };

  _onLayout = event => {
    this.setState({
      containerSize: {
        width:
          event.nativeEvent.layout.width < event.nativeEvent.layout.height
            ? event.nativeEvent.layout.width
            : event.nativeEvent.layout.height,
        height:
          event.nativeEvent.layout.height > event.nativeEvent.layout.width
            ? event.nativeEvent.layout.height
            : event.nativeEvent.layout.width,
      },
    });
  };

  render() {
    return (
      <View style={[styles.container]} onLayout={this._onLayout}>
        {this.state.pdfLoaded && this._renderList()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
