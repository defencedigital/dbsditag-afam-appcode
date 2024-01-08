import { IsIn, IsNotEmpty } from 'class-validator';
import { ConfigService } from '../services';
import { FormKeysEnum } from '../types/interfaces';
import { BaseDTO } from './base.dto';
import {
    IsOptional,
    Max,
    ValidationArguments,
} from 'class-validator';

export class WhichDTO extends BaseDTO {

    @IsOptional()
    testField: string;
}

export default WhichDTO;
