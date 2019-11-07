# React Native PDFView

A react native pdf viewer component 

## Getting started

```
$ npm install rn-fetch-blob aimawari/react-native-zoomable-view --save
$ npm install @aimawari/react-native-pdfview --save
```

### RN > 0.60 and above (Auto link)

`$ cd ios && pod install`

### RN <= 0.59 (*Require link)

```
$ react-native link rn-fetch-blob
$ react-native link @aimawari/react-native-pdfview
```

### **If you use RN 0.59.0 and above
Please add this to your android/app/build.gradle**
```diff
android {
+    packagingOptions {
+       pickFirst 'lib/x86/libc++_shared.so'
+       pickFirst 'lib/x86_64/libjsc.so'
+       pickFirst 'lib/arm64-v8a/libjsc.so'
+       pickFirst 'lib/arm64-v8a/libc++_shared.so'
+       pickFirst 'lib/x86_64/libc++_shared.so'
+       pickFirst 'lib/armeabi-v7a/libc++_shared.so'
+    }
}
```

### Manual installation
<details>
  <summary>iOS</summary>
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-pdfview` and add `Pdfview.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libPdfview.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<
</details>

<details>
  <summary>Android</summary>
1. Open up `android/app/src/main/java/[...]/MainApplication.java`

- Add `import com.aimawari.pdfview.PdfviewPackage;` to the imports at the top of the file
- Add `new PdfviewPackage()` to the list returned by the `getPackages()` method

2. Append the following lines to `android/settings.gradle`:
   ```
   include ':react-native-pdfview'
   project(':react-native-pdfview').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-pdfview/android')
   ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
   ```
     compile project(':react-native-pdfview')
   ```
</details>

## Usage

```javascript
import Pdfview from 'react-native-pdfview';

export const PDFExample = () => {
  return (
    <Pdfview
      horizontal
      enablePaging
      page={1}
      source={{
        uri:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      }}
      password=""
      onLoadComplete={(numberOfPages, filePath) => {}}
      onPageChanged={(page, numberOfPages) => {}}
      onError={error => {}}
      onPageSingleTap={() => {}}
      style={{flex: 1, backgroundColor: 'transparent'}}
    />
  );
};
```
