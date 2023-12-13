import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';

export class WhoseMedalsDTO {
  @IsIn(ConfigService.APPLYING_FOR, {
    message: `Select whose medals you are applying for`,
  })
  @IsNotEmpty({
    message: `Select whose medals you are applying for`,
  })
  [FormKeysEnum.WHOSE_MEDALS]: string;
}

export default WhoseMedalsDTO;
