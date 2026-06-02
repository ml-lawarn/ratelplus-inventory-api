import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        const isObj = data && typeof data === 'object';
        const message =
          isObj && 'message' in data && typeof data.message === 'string'
            ? data.message
            : 'Request successful';
        const payload =
          isObj && 'data' in data
            ? (data as Record<string, unknown>).data
            : data;

        return {
          success: true,
          message,
          data: payload,
        };
      }),
    );
  }
}
