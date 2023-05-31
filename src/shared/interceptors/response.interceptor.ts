import {
  NestInterceptor,
  Injectable,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { IGenericResponse } from '../apiResponse';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const genericResponse: Observable<IGenericResponse<any>> = next.handle();
    return genericResponse.pipe(
      map((data: IGenericResponse<any>) => {
        if (!data) {
          throw new HttpException(
            'no response from server function',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        const res = context.switchToHttp().getResponse();

        if (data.error) {
          console.log('intercepted error', data.error);
          if (
            data.error.name === 'ValidationError' ||
            data.error.name === 'MongooseValidatorError' ||
            data.error.name === 'UserExistsError'
          ) {
            if (data.error.errors) {
              const errorKeysArray = Object.keys(data.error.errors);
              const errors: string[] = errorKeysArray.map(
                (key) => data.error.errors[key].message,
              );
              data.message = errors[0];
              data.error = errors;
            } else {
              data.error = data.error.message;
            }
            res.status(HttpStatus.BAD_REQUEST);
            data.statusCode = HttpStatus.BAD_REQUEST;
          }
          return data;
        }
        res.status(data.statusCode);
        return data;
      }),
    );
  }
}
