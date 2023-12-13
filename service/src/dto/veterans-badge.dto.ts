import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';

export class VeteransBadgeDTO {
  @IsIn([ConfigService.YES, ConfigService.NO, ConfigService.I_DONT_KNOW], {
    message: `Select have you received your veterans badge`,
  })
  @IsNotEmpty({
    message: `Select have you received your veterans badge`,
  })
  [FormKeysEnum.VETERANS_BADGE]: string;
}

export default VeteransBadgeDTO;
