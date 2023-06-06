import {Post, Get, Body, Param, Res, Controller, Req } from '@nestjs/common';
import { UrlService } from './url.service';
import { DecodeURLDto, EncodeURLDto} from './dtos/url.dto';
import { ApiResponse, IGenericResponse } from '../shared/apiResponse';
import { IURLData } from '../shared/typings';
import { Request, Response } from 'express';
@Controller()
export class UrlController {
    constructor(private urlService: UrlService){}

    @Post("/encode")
    async encodeUrl(@Body() payload: EncodeURLDto, @Req() req: Request): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.encodeURL(payload.url, req.ip)
    }

    @Post("/decode")
    async decodeUrl(@Body() payload: DecodeURLDto): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.decodeURL(payload.shortCode)
    }

    @Get("/statistics/:url_path")
    async getUrlStatistics(@Param("url_path") urlPath: string): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.getURLStatistics(urlPath)
    }

    @Get("/:url_path")
    async redirectToOriginalUrl(@Param("url_path") urlPath: string, @Res() res: Response){
        const decodedUrlData = (await this.urlService.decodeURL(urlPath)).data as IURLData;
        try{
            return res.redirect(decodedUrlData.originalUrl);
        }catch(error){
            return await this.urlService.updateUrlData<number>(urlPath,"numberOfFailedRedirects", 1, "_inc")
        }
    }
}
