//
//  PdfUIViewKitManager.swift
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

@objc(PdfUIViewKitManager)
class PdfUIViewKitManager: RCTViewManager {
    override func view() -> UIView! {
        if #available(iOS 11.0, *) {
            return PdfUIViewKit()
        }else{
            return UIView()
        }
    }
    
    override static func requiresMainQueueSetup() -> Bool {
      return true
    }
}
