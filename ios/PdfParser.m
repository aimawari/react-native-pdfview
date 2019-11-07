//
//  PdfParser.m
//  Pdfview
//
//  Created by aimawari on 6/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(PdfParser, NSObject)
RCT_EXTERN_METHOD(load:(NSString *)path
                  password:(NSString *)password
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject)
@end
