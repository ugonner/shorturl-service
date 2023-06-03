import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { URLStore, URLStoreDocument } from './url.schema';
import { ApiResponse, IGenericResponse } from '../shared/apiResponse';
import { EncodeURLDto } from './dtos/url.dto';
import { IURLData, IURLStatics } from '../shared/typings';
import { URL } from 'url';
import * as dns from 'dns';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(URLStore.name)
    private urlStoreModel: Model<URLStoreDocument>,
  ) {}

  async getUrlStringUniqueCode(noOfChars: number): Promise<IGenericResponse<string>> {
    try {
      let shortCode: string;
      do {
        for(let i = 1; i < noOfChars; i++){
          shortCode += Math.random().toString(16)[i+1];
        }
      } while (await this.urlStoreModel.findOne({ shortCode }));
      return ApiResponse.success('code generated', HttpStatus.OK, shortCode);
    } catch (error) {
      return ApiResponse.fail(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async encodeURL(url: string, createdBy: string): Promise<IGenericResponse<IURLData | unknown>> {
    try {
      const isVerifiedUrl = await UrlService.isWorkingUrl(url);
      if (!isVerifiedUrl.status)
        return ApiResponse.fail(
          'This is not a working URL, check your site server admin',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );

      const urlExists = await this.urlStoreModel.findOne({ originalUrl: url });
      if (urlExists)
        return ApiResponse.fail(
          'This URL already in our system',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );

      const shortCodeResult = await this.getUrlStringUniqueCode(10);
      if (!shortCodeResult.status) return shortCodeResult;
      let shortUrl = `${process.env.SHORT_BASE_URL  +":"+ process.env.PORT +"/"+ shortCodeResult.data}`;
      
      await this.urlStoreModel.create({
        originalUrl: url,
        shortCode: shortCodeResult.data,
        shortUrl,
        createdBy
      });
      return ApiResponse.success<IURLData>('url encoded successfully', HttpStatus.CREATED, {
        originalUrl: url,
        shortUrl,
        shortCode: shortCodeResult.data
      });
    } catch (error) {
      return ApiResponse.fail(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async decodeURL(shortCode: string): Promise<IGenericResponse<IURLData | unknown>>{
    try{
        const shortUrlDoc = await this.urlStoreModel.findOne({shortCode});
        if(!shortUrlDoc) return ApiResponse.fail("This short code is not in our record", HttpStatus.NOT_FOUND);
        
        const isDNSUp = await UrlService.isWorkingUrl(shortUrlDoc.originalUrl);
        let originalUrlStatus: "down" | "up" = "up";
        if(!isDNSUp){
            originalUrlStatus = "down";
            shortUrlDoc.urlServerDownAtRedirects += 1;

        }
        shortUrlDoc.numberOfVisits += 1;
        await shortUrlDoc.save();
        return ApiResponse.success<IURLData>("url code decoded successfully", HttpStatus.OK, {originalUrl: shortUrlDoc.originalUrl, shortUrl: shortUrlDoc.shortUrl, shortCode: shortUrlDoc.shortCode, originalUrlStatus});
    }catch(error){
        return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
}


async getURLStatistics(shortCode: string): Promise<IGenericResponse<IURLStatics | unknown>>{
    try{
        
        const shortUrlDoc = await this.urlStoreModel.findOne({shortCode});
        if(!shortUrlDoc) return ApiResponse.fail(`This url path ${shortCode} is not in our record`, HttpStatus.NOT_FOUND);
        
        const isDNSUp = await UrlService.isWorkingUrl(shortUrlDoc.originalUrl);
        let originalUrlStatus: "down" | "up" = "up";
        if(!isDNSUp){
            originalUrlStatus = "down";
            shortUrlDoc.urlServerDownAtRedirects += 1;
        }
        await shortUrlDoc.save();
        const {originalUrl, shortUrl,registeredAt, createdBy, numberOfVisits, numberOfFailedRedirects, urlServerDownAtRedirects} = shortUrlDoc;
        const urlStatistics: IURLStatics = {
            originalUrl, shortUrl, shortCode,registeredAt, createdBy, numberOfVisits, numberOfFailedRedirects, urlServerDownAtRedirects,
            originalUrlStatus
        }
        return ApiResponse.success<IURLStatics>("url statistics got successfully", HttpStatus.OK, urlStatistics);
    }catch(error){
        return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
}



  static async isWorkingUrl(url: string): Promise<IGenericResponse<boolean>> {
    try {
      url = new URL(url).hostname;
      const requestURLPromise = new Promise((resolve, reject) => {
        dns.lookup(url, (error, data) => {
          error ? reject(error) : resolve(data);
        });
      });

      const validResponse = await requestURLPromise;
      return validResponse
        ? ApiResponse.success('valid', HttpStatus.OK, true)
        : ApiResponse.fail('invalid', HttpStatus.OK, validResponse);
    } catch (error) {
      return ApiResponse.fail(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      ); // Resolve with false if the URL is invalid
    }
  }
}
