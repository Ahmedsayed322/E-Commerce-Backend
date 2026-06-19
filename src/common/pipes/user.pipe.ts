import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable({})
export class userPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown) {
    const { success, error } = this.schema.safeParse(value);
    if (!success) {
      throw new HttpException(
        {
          message: 'Validation Error',
          error: error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        HttpStatus.I_AM_A_TEAPOT,
      );
    }
    return value;
  }
}
