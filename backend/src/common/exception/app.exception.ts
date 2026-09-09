import { HttpException } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(statusCode: number, message: string) {
    super(message, statusCode);
  }
}
