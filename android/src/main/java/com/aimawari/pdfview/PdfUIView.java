package com.aimawari.pdfview;

import java.io.File;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.util.Log;
import android.graphics.PointF;
import android.net.Uri;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.graphics.Canvas;
import javax.annotation.Nullable;


import com.github.barteksc.pdfviewer.PDFView;
import com.github.barteksc.pdfviewer.listener.OnPageChangeListener;
import com.github.barteksc.pdfviewer.listener.OnLoadCompleteListener;
import com.github.barteksc.pdfviewer.listener.OnErrorListener;
import com.github.barteksc.pdfviewer.listener.OnRenderListener;
import com.github.barteksc.pdfviewer.listener.OnTapListener;
import com.github.barteksc.pdfviewer.listener.OnDrawListener;
import com.github.barteksc.pdfviewer.listener.OnPageScrollListener;
import com.github.barteksc.pdfviewer.util.FitPolicy;
import com.github.barteksc.pdfviewer.util.Constants;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.common.logging.FLog;
import com.facebook.react.common.ReactConstants;

import static java.lang.String.format;
import java.lang.ClassCastException;

import com.shockwave.pdfium.PdfDocument;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class PdfUIView extends PDFView implements OnPageChangeListener,OnLoadCompleteListener,OnErrorListener,OnTapListener,OnDrawListener,OnPageScrollListener {
    private ThemedReactContext context;
    private int page = 1;
    private String path;
    private String password = "";
    private float zoom = 1;
    private float minZoom = 1;
    private float maxZoom = 3;
    private int spacing = 10;

    private boolean horizontal = false;
    private boolean enablePaging = false;
    
    
    private FitPolicy fitPolicy = FitPolicy.BOTH;

    private float lastPageWidth = 0;
    private float lastPageHeight = 0;


    public PdfUIView(ThemedReactContext context, AttributeSet set){
        super(context,set);
        this.context = context;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (this.isRecycled())
            this.drawPdf();
    }

    public void drawPdf() {
        if (this.path != null){

            this.setMinZoom(this.minZoom);
            this.setMaxZoom(this.maxZoom);
            this.setMidZoom((this.maxZoom+this.minZoom)/2);
            Constants.Pinch.MINIMUM_ZOOM = this.minZoom;
            Constants.Pinch.MAXIMUM_ZOOM = this.maxZoom;

            this.fromUri(getURI(this.path))
                .defaultPage(this.page-1)
                .swipeHorizontal(this.horizontal)
                .onPageChange(this)
                .onLoad(this)
                .onError(this)
                .onTap(this)
                .onDraw(this)
                .onPageScroll(this)
                .spacing(this.spacing)
                .password(this.password)
                .pageFitPolicy(this.fitPolicy)
                .pageSnap(this.enablePaging)
                .autoSpacing(this.enablePaging)
                .pageFling(this.enablePaging)
                .load();

        }
    }

    @Override
    public void onPageChanged(int page, int numberOfPages) {
        page = page+1;
        this.page = page;

        WritableMap event = Arguments.createMap();
        event.putString("message", "pageChanged|"+page+"|"+numberOfPages);
        ReactContext reactContext = (ReactContext)this.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
            this.getId(),
            "topChange",
            event
         );
    }

    @Override
    public void loadComplete(int numberOfPages) {

        float width = this.getWidth();
        float height = this.getHeight();
        
        this.zoomTo(this.zoom);
        WritableMap event = Arguments.createMap();
        
        //create a new jason Object for the TableofContents
        Gson gson = new Gson();
        event.putString("message", "loadComplete|"+numberOfPages+"|"+width+"|"+height+"|"+gson.toJson(this.getTableOfContents()));
        ReactContext reactContext = (ReactContext)this.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
            this.getId(),
            "topChange",
            event
         );
    }

    @Override
    public void onError(Throwable t){
        WritableMap event = Arguments.createMap();
        if (t.getMessage().contains("Password required or incorrect password")) {
            event.putString("message", "error|Password required or incorrect password.");
        } else {
            event.putString("message", "error|"+t.getMessage());
        }

        ReactContext reactContext = (ReactContext)this.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
            this.getId(),
            "topChange",
            event
         );
    }

    @Override
    public void onPageScrolled(int page, float positionOffset){
        Constants.Pinch.MINIMUM_ZOOM = this.minZoom;
        Constants.Pinch.MAXIMUM_ZOOM = this.maxZoom;
    }

    @Override
    public boolean onTap(MotionEvent e){
        WritableMap event = Arguments.createMap();
        event.putString("message", "pageSingleTap|"+page);

        ReactContext reactContext = (ReactContext)this.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
            this.getId(),
            "topChange",
            event
         );

         return true;
    }

    @Override
    public void onLayerDrawn(Canvas canvas, float pageWidth, float pageHeight, int displayedPage){

        if (lastPageWidth>0 && lastPageHeight>0 && (pageWidth!=lastPageWidth || pageHeight!=lastPageHeight)) {
            Constants.Pinch.MINIMUM_ZOOM = this.minZoom;
            Constants.Pinch.MAXIMUM_ZOOM = this.maxZoom;

            WritableMap event = Arguments.createMap();
            event.putString("message", "zoomChanged|"+(pageWidth/lastPageWidth));

            ReactContext reactContext = (ReactContext)this.getContext();
            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                this.getId(),
                "topChange",
                event
             );
        }

        lastPageWidth = pageWidth;
        lastPageHeight = pageHeight;
    }

    private Uri getURI(final String uri) {
        Uri parsed = Uri.parse(uri);

        if (parsed.getScheme() == null || parsed.getScheme().isEmpty()) {
        return Uri.fromFile(new File(uri));
        }
        return parsed;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setPage(int page) {
        this.page = page>1 ? page : 1;
    }

    public void setZoom(float zoom) {
        this.zoom = zoom;
    }

    public void setMinZoom(float minZoom) {
        this.minZoom = minZoom;
    }

    public void setMaxZoom(float maxZoom) {
        this.maxZoom = maxZoom;
    }

    public void setHorizontal(boolean horizontal) {
        this.horizontal = horizontal;
    }

    public void setSpacing(int spacing) {
        this.spacing = spacing;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setEnablePaging(boolean enablePaging) {
        this.enablePaging = enablePaging;
    }

    private void showLog(final String str) {
        Log.d("PdfUIView", str);
    }

    
}