import React, {Component} from 'react';
import {View, StyleSheet, requireNativeComponent} from 'react-native';

export default class PdfViewKit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: this.props.page,
      currentPage: 1,
      renderPDFView: true,
    };

    this._tapmillis = 0;
    this._tapXY = {
      x: 0,
      y: 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.path !== nextProps.path ||
      this.props.page !== nextProps.page ||
      this.props.zoom !== nextProps.zoom ||
      this.props.horizontal !== nextProps.horizontal ||
      this.props.enablePaging !== nextProps.enablePaging
    ) {
      this.setState(
        {
          renderPDFView: false,
        },
        () => {
          this.setState({
            page: this.state.currentPage,
            renderPDFView: true,
          });
        },
      );
    }
  }

  _onItemSingleTap = index => {
    this.props.onPageSingleTap(this.state.currentPage);
  };

  _getPage = event => {
    let message = event.nativeEvent.message;

    this.setState({
      currentPage: message,
    });
  };

  render() {
    return (
      <View
        style={styles.container}
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
            this._onItemSingleTap();
            this._tapmillis = 0;
          } else {
            this._tapmillis = 0;
          }
        }}>
        {this.state.renderPDFView ? (
          <PdfView
            {...this.props}
            style={this.props.style}
            path={this.props.path}
            onChange={this.props.onChange}
            page={this.state.page}
            onGetPage={this._getPage}
          />
        ) : (
          <View />
        )}
      </View>
    );
  }
}

var PdfView = requireNativeComponent('PdfUIViewKit', PdfViewKit, {
  nativeOnly: {path: true, onChange: true, onGetPage: true},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
