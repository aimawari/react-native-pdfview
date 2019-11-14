//
//  PdfUIViewPage.swift
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit

class PdfUIViewPage: UIView {
    private var _page: Int = 1;
    
    @objc func setPage(_ page: NSNumber) {
        _page = page.intValue
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)

        self.backgroundColor = UIColor.white;
    }

    required init?(coder aDecoder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }
    
    override func draw(_ rect: CGRect) {
        super.draw(rect)
        
        let pdfRefs = PdfParser().getDocRefs()
        
        let pdf: CGPDFDocument! = pdfRefs!
        let page: CGPDFPage! = pdf.page(at: _page)
        let pageRect: CGRect = page.getBoxRect(CGPDFBox.mediaBox)
        let scale: CGFloat = min(self.bounds.size.width / pageRect.size.width , self.bounds.size.height / pageRect.size.height)
        
        let context: CGContext = UIGraphicsGetCurrentContext()!
        
        context.setFillColor(red: 1.0,green: 1.0,blue: 1.0,alpha: 1.0)
        context.fill(self.bounds)
        context.translateBy(x: 0.0, y: self.bounds.size.height)
        context.scaleBy(x: 1.0, y: -1.0)
        context.scaleBy(x: scale, y: scale)
        
        context.drawPDFPage(page)
    }
}
