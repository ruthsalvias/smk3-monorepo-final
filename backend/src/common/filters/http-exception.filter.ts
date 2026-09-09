import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

function parseMessageToMap(rawMessage: string): Record<string, string[]> {
  if (!rawMessage) return {};
  const parts = rawMessage.split('|');
  const result: Record<string, string[]> = {};
  let hasValidPart = false;

  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex !== -1) {
      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();
      if (key && value) {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(value);
        hasValidPart = true;
      }
    }
  }

  return hasValidPart ? result : {};
}

function formatMapToKotlinString(map: Record<string, string[]>): string {
  const entries = Object.entries(map).map(([key, list]) => {
    return `${key}=[${list.join(', ')}]`;
  });
  return `{${entries.join(', ')}}`;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unknown error';
    let isAppException = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || exception.message;
      } else {
        message = exception.message;
      }
      isAppException = true;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Parse message to mimic Kotlin's custom validator error structure
    const dataMap = parseMessageToMap(message);
    const hasValidationErrors = Object.keys(dataMap).length > 0;

    if (hasValidationErrors) {
      response.status(status).json({
        status: 'fail',
        message: 'Data tidak valid',
        data: formatMapToKotlinString(dataMap),
      });
    } else {
      // If it's a known HTTP exception (like 404 or 400), use 'fail', otherwise 'error'
      const statusType = (status >= 400 && status < 500) ? 'fail' : 'error';
      response.status(status).json({
        status: statusType,
        message: message,
        data: statusType === 'fail' ? null : '',
      });
    }
  }
}
