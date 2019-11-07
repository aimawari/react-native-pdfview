//
//  PdfUIViewManager.swift
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

@objc(PdfUIViewManager)
class PdfUIViewManager: RCTViewManager {
    override func view() -> UIView! {
        return PdfUIView()
    }
    
    override static func requiresMainQueueSetup() -> Bool {
      return true
    }
}
