import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';
import { BaseDTO } from './base.dto';
import {
  IsOptional,
  Max,
  ValidationArguments,
} from 'class-validator';
import WhichDTO from './which.dto';
import { Session } from '@nestjs/common';

export class WhichServicesDTO {
  public session: Record<string, any>;
  @IsNotEmpty({
    message: `Select the services $servicePersonName served in`,

  })
  [FormKeysEnum.WHICH_SERVICES]: string;

  constructor(@Session() session: Record<string, any> = {}) {
    this.session = session
  }

}

export default WhichServicesDTO;
