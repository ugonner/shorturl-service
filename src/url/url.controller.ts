import {Post, Body, Controller } from '@nestjs/common';
import { UrlService } from './url.service';
import { EncodeURLDto} from './dtos/url.dto';
import { IGenericResponse } from 'src/shared/apiResponse';
import { IURLData } from 'src/shared/typings';

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService){}

    @Post("/encode")
    async encodeUrl(@Body() payload: EncodeURLDto): Promise<IGenericResponse<IURLData | unknown>>{
        return this.urlService.encodeURL(payload.url)
    }
}
