import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateLeadingZero } from '../../utils/utils';

@ValidatorConstraint({ async: true })
export class IsValidDayDateConstraint implements ValidatorConstraintInterface {
  validate(day: any) {
    const dayInteger = parseInt(day, 10);
    if (Number.isNaN(dayInteger)) return false;

    const hasValidLeadingZero = validateLeadingZero(day);
    if (!hasValidLeadingZero) return false;

    return dayInteger > 0 && dayInteger < 32;
  }
}

export function IsValidDayDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDayDateConstraint,
    });
  };
}
