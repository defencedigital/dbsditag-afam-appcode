import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateLeadingZero, validateMonth } from '../../utils/utils';

@ValidatorConstraint({ async: true })
export class IsValidDateMonthConstraint
  implements ValidatorConstraintInterface
{
  validate(month: any) {
    const hasValidLeadingZero = validateLeadingZero(month);
    if (!hasValidLeadingZero) return false;

    const monthInteger = parseInt(month);
    return validateMonth(monthInteger);
  }
  // defaultMessage(validationArguments?: ValidationArguments): string {
  //   return 'Validation error';
  // }
}

export function IsValidDateMonth(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateMonthConstraint,
    });
  };
}
