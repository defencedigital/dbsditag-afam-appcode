import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Render('index')
  @Get()
  getHomepage(): any {
    return {};
  }
}
