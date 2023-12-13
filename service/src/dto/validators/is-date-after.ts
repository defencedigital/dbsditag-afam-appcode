import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { IsDayAfterArgs } from '../../types/interfaces';

export function IsDateAfter(
  property: IsDayAfterArgs,
  validationOptions?: ValidationOptions,
) {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const constraints = args.constraints[0];

          const { otherDate, thisDate } = constraints;

          //  values for the date you want to compare with
          const otherDayVal = parseInt(args.object[otherDate.day]);
          const otherMonthVal = parseInt(args.object[otherDate.month]);
          const otherYearValue = parseInt(args.object[otherDate.year]);

          //   values for the date you want to ensure is after the other date
          const thisDayVal = parseInt(args.object[thisDate.day]);
          const thisMonthVal = parseInt(args.object[thisDate.month]);
          const thisYearVal = parseInt(args.object[thisDate.year]);

          //   compare day, month and year
          const thisDayIsAfter = thisDayVal > otherDayVal;
          const thisMonthIsAfter = thisMonthVal > otherMonthVal;
          const thisYearIsAfter = thisYearVal > otherYearValue;

          // return the result of the validation
          return (
            thisYearIsAfter ||
            (thisYearVal === otherYearValue && thisMonthIsAfter) ||
            (thisYearVal === otherYearValue &&
              thisMonthVal === otherMonthVal &&
              thisDayIsAfter)
          );
        },
      },
    });
  };
}
