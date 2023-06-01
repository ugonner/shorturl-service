import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { URLStore, URLStoreDocument } from './url.schema';
import { ApiResponse, IGenericResponse } from 'src/shared/apiResponse';
import { EncodeURLDto } from './dtos/url.dto';
import { IURLData } from 'src/shared/typings';
import {URL} from 'url';
import * as http from 'https';
import * as dns from 'dns'
@Injectable()
export class UrlService {
    constructor(
        @InjectModel(URLStore.name)
        private urlStoreModel: Model<URLStoreDocument>
    ){}

    async getUrlStringUniqueCode(): Promise<IGenericResponse<string>>{
        try{
            let shortCode: string;
            do{
                shortCode = Math.random().toString(16).slice(0,11);
            }
            while((await this.urlStoreModel.findOne({shortCode})))
            return ApiResponse.success("code generated", HttpStatus.OK, shortCode);
        }catch(error){
            return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error); 
        }
    }

    async encodeURL(url: string): Promise<IGenericResponse<IURLData | unknown>>{
        try{
            const isVerifiedUrl = (await UrlService.isWorkingUrl(url));
            console.log("error", isVerifiedUrl);
            if(!isVerifiedUrl.status) return ApiResponse.fail("This is not a working URL, check your server information", HttpStatus.UNPROCESSABLE_ENTITY);

            const urlExists = await this.urlStoreModel.findOne({originalUrl: url});
            if(urlExists) return ApiResponse.fail("This URL is not in our system", HttpStatus.UNPROCESSABLE_ENTITY);
            const shortCodeResult = await this.getUrlStringUniqueCode();
            if(!shortCodeResult.status) return shortCodeResult;
            await this.urlStoreModel.create({
                originalUrl: url,
                shortCode: shortCodeResult.data
            });
            return ApiResponse.success("url encoded successfully", HttpStatus.OK, {originalUrl: url, shortUrl: `${process.env.SHORT_BASE_URL + shortCodeResult.data}`});
        }catch(error){
            return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error);
        }
    }

static async isWorkingUrl(url: string): Promise<IGenericResponse<boolean>>{
  try {
    url = new URL(url).hostname;
    const requestURLPromise = new Promise((resolve, reject) => {
      const req = dns.lookup(url, (error, data) => {
        error ? reject(error) : resolve(data);
      });
    });

    const validResponse = await requestURLPromise;
    return validResponse ? ApiResponse.success("valid", HttpStatus.OK, true): ApiResponse.fail("invalid", HttpStatus.OK, validResponse);

    
  } catch (error) {
    return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error); // Resolve with false if the URL is invalid
  }
}
}
