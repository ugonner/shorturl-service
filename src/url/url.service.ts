import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { URLStore, URLStoreDocument } from './url.schema';

@Injectable()
export class UrlService {
    constructor(
        @InjectModel(URLStore.name)
        private urlStoreModel: Model<URLStoreDocument>
    ){}
}
