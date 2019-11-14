//
//  PdfUIView.swift
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit
import QuartzCore
import PDFKit

let MAX_ZOOM: Float = 3.0;
let MIN_ZOOM: Float = 1.0;

struct TOCContent: Encodable {
    var title: String
    var pageIdx: Int
    var children: Array<TOCContent>
}

@available(iOS 11.0, *)
extension PDFView {
    func disableScrollIndicator() {
        for subview in subviews {
            if let scrollView = subview as? UIScrollView {
                scrollView.showsVerticalScrollIndicator = false
                scrollView.showsHorizontalScrollIndicator = false
                
            } else {
                let uiPageViewController = subview
                for uiPageViewController_subview in uiPageViewController.subviews {
                    if let scrollView = uiPageViewController_subview as? UIScrollView {
                        scrollView.showsVerticalScrollIndicator = false
                        scrollView.showsHorizontalScrollIndicator = false
                        
                    }
                }
            }
        }
    }
}

@available(iOS 11.0, *)
class PdfUIViewKit: UIView {
    var _pdfDocument: PDFDocument?;
    var _pdfView: PDFView = PDFView();
    var _initialed: Bool = false;
    var _changedProps: Array<String> = [];
    var _scale: CGFloat = 1;
    
    private var _currentPage: Int = 1;
    
    private var _path: String = "";
    private var _page: Int = 1;
    private var _zoom: Float = 1;
    private var _minZoom: Float = MIN_ZOOM;
    private var _maxZoom: Float = MAX_ZOOM;
    private var _horizontal: Bool = false;
    private var _enablePaging: Bool = false;
    private var _enableRTL: Bool = false;
    private var _enableAnnotationRendering: Bool = true;
    private var _password: String = "";
    private var _onChange: RCTBubblingEventBlock?;
    private var _onGetPage: RCTBubblingEventBlock?;
    
    @objc func setPath(_ path: NSString) {
        _path = path as String
    }
    
    @objc func setPage(_ page: Int) {
        _page = page
    }
    
    @objc func setZoom(_ zoom: Float) {
        _zoom = zoom
    }
    
    @objc func setMinZoom(_ minZoom: Float) {
        _minZoom = minZoom
    }
    
    @objc func setMaxZoom(_ maxZoom: Float) {
        _maxZoom = maxZoom
    }
    
    @objc func setHorizontal(_ horizontal: Bool) {
        _horizontal = horizontal
    }
    
    @objc func setEnablePaging(_ enablePaging: Bool) {
        _enablePaging = enablePaging
    }
    
    @objc func setEnableRTL(_ enableRTL: Bool) {
        _enableRTL = enableRTL
    }
    
    @objc func setEnableAnnotationRendering(_ enableAnnotationRendering: Bool) {
        _enableAnnotationRendering = enableAnnotationRendering
    }
    
    @objc func setPassword(_ password: NSString) {
        _password = password as String
    }
    
    @objc func setOnChange(_ onChange: @escaping RCTBubblingEventBlock) {
        _onChange = onChange
    }
    
    @objc func setOnGetPage(_ onGetPage: @escaping RCTBubblingEventBlock) {
        _onGetPage = onGetPage
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        _pdfView = PDFView.init(frame: CGRect(x: 0, y: 0, width: 500, height: 500));
        _pdfView.displayMode = PDFDisplayMode.singlePageContinuous;
         _pdfView.autoScales = true;
        _pdfView.displaysPageBreaks = false;
        _pdfView.displayBox = PDFDisplayBox.cropBox;
        _pdfView.disableScrollIndicator();
        _pdfView.backgroundColor = UIColor.clear;
        
        _initialed = false;

        self.addSubview(_pdfView)
        
        // register notification
        let center: NotificationCenter = NotificationCenter.default;
        center.addObserver(self, selector: #selector(onDocumentChanged(_:)), name: Notification.Name.PDFViewDocumentChanged, object: _pdfView);
        center.addObserver(self, selector: #selector(onPageChanged(_:)), name: Notification.Name.PDFViewPageChanged, object: _pdfView);
        center.addObserver(self, selector: #selector(onZoomChanged(_:)), name: Notification.Name.PDFViewScaleChanged, object: _pdfView);
    }

    required init?(coder aDecoder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }
    
    override func didSetProps(_ changedProps: [String]!) {
        if (!_initialed) {
            _changedProps = changedProps;
        } else {

            if (changedProps.contains("path")) {
                let fileURL = URL(fileURLWithPath: _path);

                if (_pdfDocument != nil) {
                    //Release old doc
                    _pdfDocument = nil;
                }

                _pdfDocument = PDFDocument.init(url: fileURL)

                if (_pdfDocument != nil) {

                    //check need password or not
                    if (_pdfDocument!.isLocked && !_pdfDocument!.unlock(withPassword: _password)) {

                        _onChange!(["message": "error|Password required or incorrect password."]);

                        _pdfDocument = nil;
                        return;
                    }

                    _pdfView.document = _pdfDocument;
                } else {

                    _onChange!(["message": "error|Load pdf failed. path=\(_path)"]);

                    _pdfDocument = nil;
                    return;
                }
            }
            
            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("enableRTL")) {

                _pdfView.displaysRTL = _enableRTL;
            }

            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("enableAnnotationRendering")) {

                if (!_enableAnnotationRendering) {
                    for i in 0..<_pdfView.document!.pageCount {
                        let pdfPage: PDFPage? = _pdfView.document!.page(at: i)
                        for j in 0..<pdfPage!.annotations.count {
                            pdfPage!.annotations[j].shouldDisplay = _enableAnnotationRendering;
                        }
                    }
                }

            }

            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("minScale")) {
                let pdfPage: PDFPage? = _pdfView.document!.page(at: _pdfDocument!.pageCount-1);
                var pdfPageRect: CGRect = pdfPage!.bounds(for: PDFDisplayBox.cropBox)

                if (pdfPage!.rotation == 90 || pdfPage!.rotation == 270) {
                    pdfPageRect = CGRect(x: 0, y: 0, width: pdfPageRect.size.height, height: pdfPageRect.size.width)
                }
                
                _scale = min(self.frame.size.width / pdfPageRect.size.width , self.frame.size.height / pdfPageRect.size.height)
                
                _pdfView.scaleFactor = _scale * CGFloat(_zoom);
                _pdfView.minScaleFactor = _scale * CGFloat(_minZoom);
                _pdfView.maxScaleFactor = _scale * CGFloat(_maxZoom);
            }

            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("horizontal")) {
                if (_horizontal) {
                    _pdfView.displayDirection = PDFDisplayDirection.horizontal;
                } else {
                    _pdfView.displayDirection = PDFDisplayDirection.vertical;
                }
            }

            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("enablePaging")) {
                if (_enablePaging) {
                    _pdfView.usePageViewController(
                        true
                    );
                } else {
                    _pdfView.usePageViewController(false, withViewOptions: nil);
                }
            }

            if (_pdfDocument != nil && changedProps.contains("path") || changedProps.contains("enablePaging") || changedProps.contains("horizontal") || changedProps.contains("page")) {

                let pdfPage: PDFPage? = _pdfDocument!.page(at: _page-1);
                if (pdfPage != nil) {
                    var pdfPageRect: CGRect = pdfPage!.bounds(for: PDFDisplayBox.cropBox)
                    
                    if (pdfPage!.rotation == 90 || pdfPage!.rotation == 270) {
                        pdfPageRect = CGRect(x: 0, y: 0, width: pdfPageRect.size.height, height: pdfPageRect.size.width);
                    }

                    let pointLeftTop: CGPoint = CGPoint(x: 0, y: pdfPageRect.size.height);
                    let pdfDest: PDFDestination = PDFDestination.init(page: pdfPage!, at: pointLeftTop)
                    _pdfView.go(to: pdfDest);
                }
            }

            print(UIDevice.current.orientation)

            _pdfView.layoutDocumentView();
            _pdfView.disableScrollIndicator()
            self.setNeedsDisplay();
        }
    }
    

    override func reactSetFrame(_ frame: CGRect){
        super.reactSetFrame(frame)
        _pdfView.frame = CGRect(x: 0, y: 0, width: frame.size.width, height: frame.size.height)

        _initialed = true;
        
        self.didSetProps(_changedProps)
    }
    
    @objc private func onDocumentChanged(_ noti: Notification){
        if (_pdfDocument != nil) {
            
            let numberOfPages: Int = _pdfDocument!.pageCount;
            let page: PDFPage? = _pdfDocument!.page(at: _pdfDocument!.pageCount-1);
            let pageSize: CGSize? = _pdfView.rowSize(for: page!);
            let jsonString: String = self.getTableContents();
            
            _onChange!(["message": "loadComplete|\(numberOfPages)|\(pageSize!.width)|\(pageSize!.height)|\(jsonString)"]);
        }
    }
    
    @objc private func onPageChanged(_ noti: Notification){
        if (_pdfDocument != nil) {
            let currentPage: PDFPage? = _pdfView.currentPage;
            let page: Int = _pdfDocument!.index(for: currentPage!);
            let numberOfPages = _pdfDocument!.pageCount;
            
            _currentPage = page+1
            _onGetPage!(["message": page+1]);
            _onChange!(["message": "pageChanged|\(page+1)|\(numberOfPages)"]);
        }
    }
    
    @objc private func onZoomChanged(_ noti: Notification?){
        if (_initialed) {
            if(_zoom != Float(_pdfView.scaleFactor / _scale)){
                _onChange!(["message": "zoomChanged|\(Float(_pdfView.scaleFactor / _scale))"]);
            }
        }
    }
    
    func getRecursionChildren(_ rootOutline: PDFOutline?) -> Array<TOCContent> {
        if(rootOutline!.numberOfChildren != 0){
            var parentContent: Array<TOCContent> = Array.init();
            for i in (0..<rootOutline!.numberOfChildren){
              let thisRoot = rootOutline!.child(at: i)!
                            
              let content = TOCContent(
                    title: thisRoot.label ?? "",
                    pageIdx: _pdfDocument!.index(for: thisRoot.destination!.page!),
                    children: getRecursionChildren(thisRoot)
                );
                parentContent.append(content)
            }
            
            return parentContent;
        }else{
            return []
        }
    }
    
    func getTableContents() -> String {
        var arrTableOfContents: Array<TOCContent> = [];
        
        if (_pdfDocument!.outlineRoot != nil) {
            
            let currentRoot: PDFOutline? = _pdfDocument!.outlineRoot;
            arrTableOfContents = getRecursionChildren(currentRoot!)
        }
        
        do{
            let jsonEncodeData = try JSONEncoder().encode(arrTableOfContents)
            return String(data: jsonEncodeData, encoding: .utf8)!;
        }catch{
            print("Error = \(arrTableOfContents)")
        }
        
        return "";
    }
}
