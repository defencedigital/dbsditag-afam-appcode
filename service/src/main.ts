import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { config } from 'dotenv';
import cookieSession = require('cookie-session');
import { nestCsrf } from 'ncsrf';
import { ConfigService } from './services';
import { HttpExceptionFilter } from './filters/http-exception.filter';

import {
  GOVUK_FRONTEND,
  GOVUK,
  ENVIRONMENT,
  PRODUCTION,
} from './constants/constants';
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const express = app.getHttpAdapter().getInstance();
  const views = join(__dirname, '..', 'views');
  const assets = join(__dirname, '..', 'public');
  const configService = app.get(ConfigService);

  app.useStaticAssets(assets);
  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  app.use(
    helmet.frameguard({
      action: 'deny',
    }),
  );

  app.use(helmet.xssFilter());
  app.use(helmet.hsts());

  // use govuk js
  app.useStaticAssets(
    join(__dirname, '..', 'node_modules', GOVUK_FRONTEND, GOVUK, 'all.js'),
    { prefix: '/assets/js/all.js' },
  );

  // use govuk fonts
  app.useStaticAssets(
    join(
      __dirname,
      '..',
      'node_modules',
      GOVUK_FRONTEND,
      GOVUK,
      'assets',
      'fonts',
    ),
    { prefix: '/assets/fonts' },
  );

  // use govuk images
  app.useStaticAssets(
    join(
      __dirname,
      '..',
      'node_modules',
      GOVUK_FRONTEND,
      GOVUK,
      'assets',
      'images',
    ),
    { prefix: '/assets/images' },
  );
  const govLibPath = join(__dirname, '..', 'node_modules', GOVUK_FRONTEND);

  nunjucks.configure([govLibPath, views], {
    express,
    watch: true,
    autoescape: true,
  });

  app.use(
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SESSION_KEY, process.env.COOKIE_SESSION_KEY_2],
      maxAge:
        configService.get(ENVIRONMENT) === PRODUCTION ? 0 : 24 * 60 * 60 * 1000, // 24 hours
      // secure option should be set to true for production environments to ensure the cookie is sent over HTTPS
      secure: configService.get(ENVIRONMENT) === PRODUCTION,
      // sameSite option to prevent the browser from sending this cookie along with cross-site requests
      sameSite: 'strict',
    }),
  );

  app.use([cookieParser(process.env.§)]);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setLocal('serviceName', 'Apply for a military medal');
  app.setLocal('saveButtonLabel', 'Continue');

  app.use([
    nestCsrf({
      ttl: 6000,
    }),
  ]);

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        //  adds a hash to allow the inline script from the govuk frontend library that uses an inline script to add js-enabled
        //as described here https://github.com/alphagov/govuk-frontend-docs/issues/68
        'script-src': [
          "'self'",
          "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
        ],
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
