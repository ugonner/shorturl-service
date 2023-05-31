import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { URLStore, URLStoreDocument } from './url.schema';
import { ApiResponse } from 'src/shared/apiResponse';

@Injectable()
export class UrlService {
    constructor(
        @InjectModel(URLStore.name)
        private urlStoreModel: Model<URLStoreDocument>
    ){}
}
