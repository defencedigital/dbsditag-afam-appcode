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
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Csrf } from 'ncsrf';
import { JourneyInterceptor } from 'src/interceptors/journey.interceptor';
import { IRequest, IResponse, ISession } from 'src/types/interfaces';
import { Request } from 'express'
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
    @Body() reqBody
  ): Promise<any> {
    // console.log('CONTROLLER the session == ', { reqBody, session })
    // const 
    return {};
  }

  @Csrf()
  @Post(':node/submit-form')
  @UseInterceptors(JourneyInterceptor)
  async saveForm(
    @Param('node') node: string,
    @Req() req: Request,
    @Res() res: IResponse,
    @Body() reqBody,
    @Session() session: ISession,
  ) {


    const { default: dtoModule } = await import(
      "../dto/which-services.dto"
    );

    const answers = {
      answers: JSON.parse(
        JSON.stringify(session.userData ? session.userData : {}),
      ),
    };
    delete answers['session'];

    const dtoData = { ...JSON.parse(JSON.stringify(reqBody)), ...answers };
    const dto = new dtoModule(dtoData);
    const errors = await validate(dtoData);
    return res.redirect(req.gotoNext);
  }
}
