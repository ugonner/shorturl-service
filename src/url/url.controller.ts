import {Post,Get, Body, Param, Controller, Req } from '@nestjs/common';
import { UrlService } from './url.service';
import { DecodeURLDto, EncodeURLDto} from './dtos/url.dto';
import { IGenericResponse } from '../shared/apiResponse';
import { IURLData } from '../shared/typings';
import { Request } from 'express';
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
}
