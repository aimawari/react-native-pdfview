package com.aimawari.pdfview;

import java.io.File;

import android.content.Context;
import android.view.ViewGroup;
import android.util.Log;
import android.graphics.PointF;
import android.net.Uri;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static java.lang.String.format;
import java.lang.ClassCastException;

import com.github.barteksc.pdfviewer.util.FitPolicy;

public class PdfUIViewManager extends SimpleViewManager<PdfUIView> {

    public static final String REACT_CLASS = "PdfUIViewAndroid";

    private PdfUIView pdfUIView;
    private Context context;

    public PdfUIViewManager(ReactApplicationContext reactContext){
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public PdfUIView createViewInstance(ThemedReactContext context) {
        this.pdfUIView = new PdfUIView(context,null);
        return pdfUIView;
    }

    @Override
    public void onDropViewInstance(PdfUIView pdfUIView) {
        pdfUIView = null;
    }

    // ============ React Props ============

    @ReactProp(name = "path")
    public void setPath(PdfUIView pdfUIView, String path) {
        pdfUIView.setPath(path);
    }

    @ReactProp(name = "page")
    public void setPage(PdfUIView pdfUIView, int page) {
        pdfUIView.setPage(page);
    }

    @ReactProp(name = "zoom")
    public void setZoom(PdfUIView pdfUIView, float zoom) {
        pdfUIView.setZoom(zoom);
    }

    @ReactProp(name = "minZoom")
    public void setMinZoom(PdfUIView pdfUIView, float minZoom) {
        pdfUIView.setMinZoom(minZoom);
    }

    @ReactProp(name = "maxZoom")
    public void setMaxZoom(PdfUIView pdfUIView, float maxZoom) {
        pdfUIView.setMaxZoom(maxZoom);
    }

    @ReactProp(name = "horizontal")
    public void setHorizontal(PdfUIView pdfUIView, boolean horizontal) {
        pdfUIView.setHorizontal(horizontal);
    }

    @ReactProp(name = "spacing")
    public void setSpacing(PdfUIView pdfUIView, int spacing) {
        pdfUIView.setSpacing(spacing);
    }

    @ReactProp(name = "password")
    public void setPassword(PdfUIView pdfUIView, String password) {
        pdfUIView.setPassword(password);
    }

    @ReactProp(name = "enablePaging")
    public void setEnablePaging(PdfUIView pdfUIView, boolean enablePaging) {
        pdfUIView.setEnablePaging(enablePaging);
    }

    @Override
    public void onAfterUpdateTransaction(PdfUIView pdfUIView) {
        super.onAfterUpdateTransaction(pdfUIView);
        pdfUIView.drawPdf();
    }

}
