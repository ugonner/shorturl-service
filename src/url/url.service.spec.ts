import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import {MongoMemoryServer} from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { URLStore, URLStoreSchema } from './url.schema';
import mongoose from 'mongoose';
import { IURLData } from 'src/shared/typings';
import { ConfigModule } from '@nestjs/config';

describe('UrlService', () => {
  let service: UrlService;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const databaseUri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true}),
        MongooseModule.forRoot(databaseUri),
        MongooseModule.forFeature([
          {name: URLStore.name, schema: URLStoreSchema}
        ])
      ],
      providers: [UrlService],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  })

  let shortCode;
  let validUrl = "http://google.com";
  let invalidShortCode="iAL23IGAN";

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("positive tests for create short url", () => {
    it("should generate a unique string", async () => {
      const code = await service.getUrlStringUniqueCode(10);
      expect(code).toHaveProperty("data");
      expect(code.data).toMatch(/[a-zA-Z0-9]/g)
    })
    it("should return a url", async () => {
      const result = await service.encodeURL(validUrl, "owner")
      expect(result).toHaveProperty("data");
      shortCode = (result.data as any).shortCode;
      expect(result.data).toHaveProperty("shortUrl");
      const urlRegex = /http(s)?:\/\/[a-zA-Z0-9:.]+\/[a-zA-Z0-9]+/;
      expect((result.data as IURLData).shortUrl).toMatch(urlRegex)
    })
  })

  describe("negative tests for create short url", () => {
    it("should reject INVALID URL entries", async () => {
      const result = await service.encodeURL("http://bonaventureumeokwonna.com", "bon");
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("status");
      expect(result.status).toBeFalsy();
      expect(result.data).toBeNull();
      expect(result.message).toMatch('This is not a working URL, check your site server admin');

    })
    
    it("should reject duplicate URL entries", async () => {
      const result = await service.encodeURL(validUrl, "bon");
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("status");
      expect(result.status).toBeFalsy();
      expect(result.data).toBeNull();
      expect(result.message).toMatch('This URL already in our system');

    })

  })

  describe("test for decode a shortcode", () => {
  
    it("should return a url", async () => {
      const result = await service.decodeURL(shortCode)
      expect(result).toHaveProperty("data");
      shortCode = (result.data as any).shortCode;
      expect(result.data).toHaveProperty("originalUrl");
      expect((result.data as IURLData).originalUrl).toMatch(validUrl)
    })
  });

  describe("NEGATIVE test for decode a shortcode", () => {
  
    it("should reject invalid shortcode / url_path", async () => {
      const result = await service.decodeURL(invalidShortCode)
      expect(result.status).toBeFalsy();
      expect(result.data).toBeNull();
      expect(result.message).toMatch("This short code is not in our record")
    })
  });


});
