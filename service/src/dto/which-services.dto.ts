import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';

export class WhichServicesDTO {
  @IsIn(ConfigService.SERVICE_TYPES, {
    message: `Select the services $servicePersonName served in`,
  })
  @IsNotEmpty({
    message: `Select the services $servicePersonName served in`,
  })
  [FormKeysEnum.WHICH_SERVICES]: string;
}

export default WhichServicesDTO;
