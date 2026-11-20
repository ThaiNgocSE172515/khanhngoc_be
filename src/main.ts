import './shared/env.config.js';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

function setupApp(app: INestApplication) {
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://khanh-ngoc.vercel.app',
      'https://turret-elude-consuming.ngrok-free.dev'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Khanh Ngoc')
    .setDescription('A project for Khanh Ngoc Company')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  const customerConfig = {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.29.1/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.29.1/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.29.1/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      syntaxHighlight: { theme: 'monokai' },
    },
  };
  SwaggerModule.setup('api-docs', app, documentFactory, customerConfig);
}

let cachedServer: any;

async function bootstrapVercel() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, {
      instrument: ObserveInstrument,
    });
    setupApp(app);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

if (!process.env.VERCEL) {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  setupApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapVercel();
  return server(req, res);
}
