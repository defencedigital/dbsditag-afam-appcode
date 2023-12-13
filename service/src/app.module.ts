import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { JourneyController } from './controllers/journey.controller';
import { LocalsPropertyMiddleware } from './middleware/locals-property.service';
import { ConfigService } from './services';

@Module({
  imports: [],
  controllers: [AppController, JourneyController],
  providers: [ConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LocalsPropertyMiddleware).forRoutes('/*');
  }
}
