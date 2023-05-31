import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import {MongooseModule} from '@nestjs/mongoose'
import { URLStore, URLStoreSchema } from './url.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {name: URLStore.name, schema: URLStoreSchema}
    ])
  ],
  controllers: [UrlController],
  providers: [UrlService]
})
export class UrlModule {}
