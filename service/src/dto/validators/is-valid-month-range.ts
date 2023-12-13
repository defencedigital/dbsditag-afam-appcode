import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateLeadingZero } from '../../utils/utils';

@ValidatorConstraint({ async: true })
export class IsValidMonthRangeConstraint
  implements ValidatorConstraintInterface
{
  validate(month: string) {
    const monthInteger = parseInt(month);
    if (Number.isNaN(monthInteger)) return false;

    const hasValidLeadingZero = validateLeadingZero(month);
    if (!hasValidLeadingZero) return false;

    return monthInteger > 0 && monthInteger < 13;
  }
}

export function IsValidMonthRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMonthRangeConstraint,
    });
  };
}
