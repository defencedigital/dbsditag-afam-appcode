import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';

export class WhichMedalsDTO {
  @IsIn([ConfigService.YES, ConfigService.NO], {
    message: `Do you know which medals you're applying for`,
  })
  @IsNotEmpty({
    message: `Do you know which medals you're applying for`,
  })
  [FormKeysEnum.WHICH_MEDALS]: string;
}

export default WhichMedalsDTO;
