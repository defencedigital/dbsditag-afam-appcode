import { FileValidator } from '@nestjs/common';

export class FileSizeValidator extends FileValidator {
  constructor({ maxSize }) {
    super({ maxSize });
  }

  isValid(file?: Express.Multer.File): boolean {
    return !!(file && file?.size < this.validationOptions?.maxSize);
  }
  buildErrorMessage(): string {
    return 'File is too large';
  }
}
