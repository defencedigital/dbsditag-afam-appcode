import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsValidDateMonthConstraint
  implements ValidatorConstraintInterface
{
  validate(year: any) {
    const yearInteger = parseInt(year);
    if (Number.isNaN(yearInteger)) return false;
    if (year?.length !== 4) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return yearInteger > 0 && yearInteger <= currentYear;
  }
}

export function IsValidDateYear(validationOptions?: ValidationOptions) {
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
