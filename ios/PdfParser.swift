//
//  PdfParser.swift
//  Pdfview
//
//  Created by aimawari on 5/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

var pdfDocRefs: CGPDFDocument?

@objc(PdfParser)
class PdfParser: NSObject {
   
    @objc
    func load(_ path: NSString,password pw: NSString,resolve on_resolve: RCTPromiseResolveBlock,reject on_reject:RCTPromiseRejectBlock){
        
        var pdfDoc: CGPDFDocument?

        let filePath = path.expandingTildeInPath;
        let urlOfDocument = NSURL(fileURLWithPath: filePath);
        pdfDoc = CGPDFDocument(urlOfDocument);
        
        if(pdfDoc != nil) {
    
            if(pdfDoc!.isEncrypted){
                let isUnlocked = pdfDoc!.unlockWithPassword((pw as String));
                if(!isUnlocked){
                    on_reject(RCTErrorUnspecified, "Password required or incorrect password.", nil);
                    
                }
            }
            
            pdfDocRefs = pdfDoc;
            
            // Get numberOfPage
            let numberOfPages = pdfDoc!.numberOfPages;
            // Get width and height of page
            let pdfPage = pdfDoc!.page(at:1);
            let pdfPageRect = pdfPage!.getBoxRect(CGPDFBox.mediaBox);
            
            // Return width,height base on portrait orientation
            let width = Int(round(pdfPageRect.size.width < pdfPageRect.size.height ? pdfPageRect.size.width : pdfPageRect.size.height));
            let height = Int(round(pdfPageRect.size.height > pdfPageRect.size.width ? pdfPageRect.size.height : pdfPageRect.size.width));
            
            
            var params: [String:Any];
            
            params = [
                "numberOfPages": numberOfPages,
                "width": width,
                "height": height
            ]
            
            print(params)
            on_resolve(params)
        }else{
            on_reject(RCTErrorUnspecified, "Load pdf failed. path=\(path as String)", nil);
        }
    }
    
    func getDocRefs() -> CGPDFDocument? {
        return pdfDocRefs
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
      return true
    }
}


