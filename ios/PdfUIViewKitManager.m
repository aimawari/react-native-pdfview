//
//  PdfUIViewKitManager.m
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "React/RCTViewManager.h"
@interface RCT_EXTERN_MODULE(PdfUIViewKitManager, RCTViewManager)

// ============ React Props ============
RCT_EXPORT_VIEW_PROPERTY(path, NSString);
RCT_EXPORT_VIEW_PROPERTY(page, int);
RCT_EXPORT_VIEW_PROPERTY(zoom, float);
RCT_EXPORT_VIEW_PROPERTY(minZoom, float);
RCT_EXPORT_VIEW_PROPERTY(maxZoom, float);
RCT_EXPORT_VIEW_PROPERTY(horizontal, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enablePaging, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableRTL, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableAnnotationRendering, BOOL);
RCT_EXPORT_VIEW_PROPERTY(password, NSString);
RCT_EXPORT_VIEW_PROPERTY(onGetPage, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock);

@end
