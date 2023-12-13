import { validateMonth } from './utils';
const validLeadingZeroNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const validMonthNumbers = [...validLeadingZeroNumbers, 10, 11, 12];
const validDayNumbers = [
  ...validMonthNumbers,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
];
const invalidMonthNumbers = [-2, -3, -1, 0, 13, 14, 15, 16, 17];

describe('validateMonth uitility function should return true for the numbers 1-12', () => {
  validMonthNumbers.forEach((number) =>
    it(` it should return true for the number ${number}`, () =>
      expect(validateMonth(number)).toBe(true)),
  );
});

describe('validateMonth uitility function should return false for numbers less than 1 and greater than 12', () => {
  invalidMonthNumbers.forEach((number) =>
    it(`it should return false for the value ${number}`, () =>
      expect(validateMonth(number)).toBe(false)),
  );
});
