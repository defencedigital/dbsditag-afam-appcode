import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';

export class ActiveServiceDTO {
  @IsIn([ConfigService.YES, ConfigService.NO], {
    message: `Select are you in active service`,
  })
  @IsNotEmpty({
    message: `Select are you in active service`,
  })
  [FormKeysEnum.ARE_YOU_ACTIVE]: string;
}

export default ActiveServiceDTO;
