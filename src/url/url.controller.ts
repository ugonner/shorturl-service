import {Post, Body, Controller, Req } from '@nestjs/common';
import { UrlService } from './url.service';
import { DecodeURLDto, EncodeURLDto} from './dtos/url.dto';
import { IGenericResponse } from 'src/shared/apiResponse';
import { IURLData } from 'src/shared/typings';
import { Request } from 'express';
@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService){}

    @Post("/encode")
    async encodeUrl(@Body() payload: EncodeURLDto): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.encodeURL(payload.url)
    }

    @Post("/decode")
    async decodeUrl(@Body() payload: DecodeURLDto): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.decodeURL(payload.shortCode)
    }
}
