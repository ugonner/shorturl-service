import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { URLStore, URLStoreDocument } from './url.schema';
import { ApiResponse, IGenericResponse } from 'src/shared/apiResponse';
import { EncodeURLDto } from './dtos/url.dto';
import { IURLData } from 'src/shared/typings';

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
            const urlExists = await this.urlStoreModel.findOne({originalUrl: url});
            if(urlExists) return ApiResponse.fail("This URL is already encoded", HttpStatus.UNPROCESSABLE_ENTITY);
            const shortCodeResult = await this.getUrlStringUniqueCode();
            if(!shortCodeResult.status) return shortCodeResult;
            await this.urlStoreModel.create({
                originalUrl: url,
                shortCode: shortCodeResult.data
            });
            return ApiResponse.success("url encoded successfully", HttpStatus.OK, {originalUrl: url, shortUrl: `${process.env.BASE_URL + shortCodeResult.data}`});
        }catch(error){
            return ApiResponse.fail(error.message, HttpStatus.INTERNAL_SERVER_ERROR, error);
        }
    }
    
}
