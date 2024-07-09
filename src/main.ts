import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  await app.listen(process.env.API_PORT || API_DEFAULT_PORT);
}
bootstrap();
