//
//  PdfUIViePagewManager.swift
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

@objc(PdfUIViewPageManager)
class PdfUIViewPageManager: RCTViewManager {
    override func view() -> UIView! {
        return PdfUIViewPage()
    }
    
    override static func requiresMainQueueSetup() -> Bool {
      return true
    }
}
