import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(port, () => console.log("listening on ", port));
}
bootstrap();
