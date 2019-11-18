# React Native PDFView

A react native pdf viewer component

## Getting started

```
$ npm install rn-fetch-blob aimawari/react-native-zoomable-view --save
$ npm install @aimawari/react-native-pdfview --save
```

Then add `maven { url "https://jitpack.io" }` to `repositories` inside `android/build.gradle`
```
allprojects {
    repositories {
       	...
        maven { url "https://jitpack.io" }
    }
}
```

<details>
  <summary>RN > 0.60 and above (Auto link)</summary>
```
$ cd ios && pod install
```
</details>

<details>
  <summary>RN <= 0.59 (*Require link)</summary>
```
$ react-native link rn-fetch-blob
$ react-native link @aimawari/react-native-pdfview
```
</details>

<details>
  <summary>If you using RN 0.59.0 and above</summary>
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
</details>

### Manual installation

<details>
  <summary>iOS</summary>
1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@aimawari` ➜ `react-native-pdfview` and add `Pdfview.xcodeproj`
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
   include ':@aimawari_react-native-pdfview'
   project(':@aimawari_react-native-pdfview').projectDir = new File(rootProject.projectDir, 	'../node_modules/@aimawari_react-native-pdfview/android')
   ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
   ```
      implementation project(':@aimawari_react-native-pdfview')
   ```
   </details>

## Usage

```javascript
import Pdfview from '@aimawari/react-native-pdfview';

export default const PDFExample = () => {
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
      onLoadComplete={(numberOfPages, path, size, toc) => {}}
      onPageChanged={(page, numberOfPages) => {}}
      onError={error => {}}
      onPageSingleTap={(page) => {}}
      style={{flex: 1, backgroundColor: 'transparent'}}
    />
  );
};
```

## Changelog
<details>
  <summary>v1.1.1 (Bug fixed)</summary>
  
<b>ANDROID</b>
  + Change pdf render plugin to use my folk.
</details>

<details>
  <summary>v1.1.0</summary>
  
  <b>IOS</b>
  + Add pdfKit support (ios >= 11)
</details>

## Note
+ IOS below than 11 currenly can't render `annotation` and get `table of contents`