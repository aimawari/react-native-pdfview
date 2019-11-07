import React, {PureComponent} from 'react';
import {View} from 'react-native';
import {requireNativeComponent} from 'react-native';

let PdfUIView = requireNativeComponent('PdfUIView', PdfPage, {
  nativeOnly: {},
});

export default class PdfPage extends PureComponent {
  static defaultProps = {
    style: {},
  };

  render() {
    const {style, width, height} = this.props;
    return (
      <View style={[style, {width, height}]}>
        <PdfUIView {...this.props} style={[style, {width, height}]} />
      </View>
    );
  }
}
