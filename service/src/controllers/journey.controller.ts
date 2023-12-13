import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
  Session,
  UseInterceptors,
} from '@nestjs/common';
import { Csrf } from 'ncsrf';
import { JourneyInterceptor } from 'src/interceptors/journey.interceptor';
import { IRequest, IResponse } from 'src/types/interfaces';
@UseInterceptors(JourneyInterceptor)
@Controller('/service')
export class JourneyController {
  private journeyConfig = require('../../journey-config.json');
  @Get(':node')
  async handleJourneyStep(
    @Param('node') node: string,
    @Req() req: IRequest,
    @Res() res,
    @Session() session,
  ): Promise<any> {
    return {};
  }

  @Csrf()
  @Post(':node/submit-form')
  @UseInterceptors(JourneyInterceptor)
  async saveForm(
    @Param('node') node: string,
    @Req() req: IRequest,
    @Res() res: IResponse,
    @Body() body,
    @Session() session,
  ) {
    return res.redirect(req.gotoNext);
  }
}
