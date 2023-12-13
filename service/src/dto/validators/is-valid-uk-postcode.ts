import {
  registerDecorator,
  ValidationOptions,
  isPostalCode,
} from 'class-validator';

export function IsValidUKPostcode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidUKPostcode',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(postcode: string) {
          // remove spaces before validating as GDS states that postcodes should not be rejected due to incorrect use of spaces by the user
          const postcodeWithWhitespaceRemoved = postcode.replace(/\s/g, '');
          return !!isPostalCode(postcodeWithWhitespaceRemoved, 'GB');
        },
      },
    });
  };
}
