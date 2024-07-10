import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './interceptors/response.interceptor';

const API_DEFAULT_PORT = 8080;

const SWAGGER_TITLE = 'Concert App API';
const SWAGGER_DESCRIPTION = 'API used for Concert App';
const SWAGGER_PREFIX = 'api-docs';

function createSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SWAGGER_PREFIX, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // create swagger
  createSwagger(app);

  // enable cors
  app.enableCors({ origin: process.env.ALLOW_DOMAIN, credentials: true });

  // class validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // bind cookie parser
  app.use(cookieParser());

  // bind response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.API_PORT || API_DEFAULT_PORT);
}
bootstrap();
