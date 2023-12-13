import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateLeadingZero } from '../../utils/utils';

@ValidatorConstraint({ async: true })
export class IsValidDayRangeConstraint implements ValidatorConstraintInterface {
  validate(day: any) {
    const dayInteger = parseInt(day);
    if (Number.isNaN(dayInteger)) return false;

    const hasValidLeadingZero = validateLeadingZero(day);
    if (!hasValidLeadingZero) return false;

    return dayInteger > 0 && dayInteger < 32;
  }
}

export function IsValidDayRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDayRangeConstraint,
    });
  };
}
