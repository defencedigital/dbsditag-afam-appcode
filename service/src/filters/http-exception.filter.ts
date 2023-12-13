import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // If the exception is a CSRF error
    if (status === 403 && exception.getResponse() === 'Invalid CSRF Token') {
      return response.status(status).render('errors/csrf-error');
    } else {
      // Otherwise, use the default error handling
      return response.status(status).render(`errors/${String(status)}`);
    }
  }
}
