import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    this.logger.error(exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const target = exception.meta?.target;
          const fields = Array.isArray(target)
            ? target.join(', ')
            : typeof target === 'string'
              ? target
              : undefined;

          return response.status(HttpStatus.CONFLICT).json({
            success: false,
            message: fields
              ? `A record with this ${fields} already exists`
              : 'Duplicate record exists',
          });
        }

        case 'P2025':
          return response.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: 'Record not found',
          });

        default:
          return response.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Database operation failed',
          });
      }
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
