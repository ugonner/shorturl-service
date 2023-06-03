import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { NestApplication } from '@nestjs/core';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { URLStore, URLStoreSchema } from './url.schema';
import mongoose from 'mongoose';
import {ValidationPipe} from '@nestjs/common'
import * as request from 'supertest';
import { IGenericResponse } from '../shared/apiResponse';
import { IURLData, IURLStatics } from '../shared/typings';
import { ResponseInterceptor } from '../shared/interceptors/response.interceptor';
describe('UrlController', () => {
  let controller: UrlController;
  let app: NestApplication;
  let mongod: MongoMemoryServer;

  const validUrl = {url: "http://facebook.com"};
  const validUrl2 = {url: "http://stripe.com"};
    const invalidUrlPattern = {url: "bonaventure$"};
    const invalidUrlDomainServer = {url: "http://bonaventure-umeokwonna.com"}
    const shortCodePayload = {shortCode: ""} ; // url_path
    const invalidShortCodePayload = {shortCode: "", bonaAttackQuery: "$where: [() => $eq: 1]"};
    const nonExistingShortCodePayload = {shortCode: "anything234"}
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const databaseUri = mongod.getUri();
    
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        ConfigModule.forRoot({isGlobal: true}),
        MongooseModule.forRoot(databaseUri),
        MongooseModule.forFeature([
          {name: URLStore.name, schema: URLStoreSchema}
        ])
      ],
      providers: [UrlService],
      controllers: [UrlController],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor())
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    }))
    await app.init()
    controller = module.get<UrlController>(UrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("positive tests for create short url", () => {
    test("that response has the generic responseBody typel", async () => {
      const response = (await request(app.getHttpServer()).post("/encode").send(validUrl));
      const responseBody = response.body
      expect(responseBody).toHaveProperty("status");
      expect(responseBody).toHaveProperty("statusCode");
      expect(responseBody).toHaveProperty("message");
      if(responseBody.status === true){
        expect(responseBody).toHaveProperty("data");
      }else{
        expect(responseBody).toHaveProperty("error");
      }
    })
    
    it("should return a url", async () => {
      const response = (await request(app.getHttpServer()).post("/encode").send(validUrl2));
      const responseBody = response.body;
      expect(responseBody).toHaveProperty("data");
      shortCodePayload.shortCode = (responseBody.data as IURLData).shortCode;
      expect(responseBody.data).toHaveProperty("shortUrl");
      const urlRegex = /http(s)?:\/\/[a-zA-Z0-9:.]+\/[a-zA-Z0-9]+/;
      expect((responseBody.data as IURLData).shortUrl).toMatch(urlRegex)
    })

    describe("negative tests for create short url", () => {
      it("should reject INVALID URL entries", async () => {
        const response = await request(app.getHttpServer()).post("/encode").send(invalidUrlPattern)
        const responseBody = response.body; 
        expect(response.statusCode).toBe(400);
        expect(responseBody).toHaveProperty("statusCode");
        expect(responseBody.status).toBeFalsy();
        expect(responseBody.data).toBeFalsy();
        expect(responseBody.message[0]).toMatch( 'url must be a URL address');
      });

      it("should reject URL with unavailable/invalid Domain entries", async () => {
        const response = await request(app.getHttpServer()).post("/encode").send(invalidUrlDomainServer)
        const responseBody = response.body; 
        expect(response.statusCode).toBe(422);
        expect(responseBody).toHaveProperty("statusCode");
        expect(responseBody.status).toBeFalsy();
        expect(responseBody.data).toBeFalsy();
        expect(responseBody.message).toMatch('This is not a working URL, check your site server admin');
      })
      
      it("should reject duplicate URL entries", async () => {
        const response = await request(app.getHttpServer()).post("/encode").send(validUrl)
        const responseBody = response.body; 
        expect(response.statusCode).toBe(422);
        expect(responseBody).toHaveProperty("statusCode");
        expect(responseBody.status).toBeFalsy();
        expect(responseBody.data).toBeFalsy();
        expect(responseBody.message).toMatch('This URL already in our system');
      })  
    })

    


  describe("positive tests for decodeUrl", () => {
    
    it("should return the original url", async () => {
      const response = (await request(app.getHttpServer()).post("/decode").send(shortCodePayload));
      const responseBody = response.body;
      
      expect(responseBody).toHaveProperty("status");
      expect(responseBody).toHaveProperty("statusCode");
      expect(responseBody).toHaveProperty("message");
      if(responseBody.status === true){
        expect(responseBody).toHaveProperty("data");
      }else{
        expect(responseBody).toHaveProperty("error");
      }})

      
    it("should return a url", async () => {
      const response = (await request(app.getHttpServer()).post("/decode").send(shortCodePayload));
      const responseBody = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseBody).toHaveProperty("data");
      expect(responseBody.data).toHaveProperty("originalUrl");
      expect((responseBody.data as IURLData).originalUrl).toMatch(validUrl2.url)
    })
  });

  describe("NEGATIVE test for decode a shortcode", () => {
  
    it("should reject unsolicited fields shortcode / url_path", async () => {
      const response = (await request(app.getHttpServer()).post("/decode").send(invalidShortCodePayload));
      const responseBody = response.body;
      expect(response.statusCode).toBe(400);
      expect(responseBody.status).toBeFalsy();
      expect(responseBody.data).toBeFalsy();
      expect(responseBody.message[0]).toMatch('property bonaAttackQuery should not exist');
    })
  
    it("should reject invalid shortcode / url_path", async () => {
      const response = (await request(app.getHttpServer()).post("/decode").send(nonExistingShortCodePayload));
      const responseBody = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseBody.status).toBeFalsy();
      expect(responseBody.data).toBeFalsy();
      expect(responseBody.message).toMatch("This short code is not in our record")
    })
  });


  

  describe("positive tests for get statistics", () => {
      
    it("should return statistics for a url-path", async () => {
      const response = (await request(app.getHttpServer()).get(`/statistics/${shortCodePayload.shortCode}`));
      const responseBody = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseBody).toHaveProperty("data");
      expect(responseBody.data).toEqual(expect.objectContaining<IURLStatics>({
        originalUrl: expect.any(String),
        shortUrl: expect.any(String),
        shortCode: expect.any(String),
        createdBy: expect.any(String),
        registeredAt: expect.any(String),
        originalUrlStatus: expect.any(String),
        numberOfVisits: expect.any(Number),
        numberOfFailedRedirects: expect.any(Number),
        urlServerDownAtRedirects: expect.any(Number),
      }))
      expect(responseBody.data).toHaveProperty("originalUrl");
      expect((responseBody.data as IURLData).originalUrl).toMatch(validUrl2.url)
    })
  });

  })




  

afterAll( async () => {
  await mongoose.disconnect();
  await mongod.stop()
  await app.close()
})
});
