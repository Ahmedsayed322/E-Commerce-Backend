import { createParamDecorator } from '@nestjs/common';

import {
  registerDecorator,
  validate,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { UserDocument } from '../../DB/models/user.model';

export function AtLeastOne(
  requiredFields: string[],

  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      name: 'atLeastOne',
      target: constructor,
      propertyName: 'AtLeastOne',
      constraints: requiredFields,
      options: validationOptions,
      validator: {
        validate(val, args) {
          return requiredFields.some((field) => args?.object[field]);
        },
        defaultMessage(args: ValidationArguments) {
          return ` body must match one of the following fields: ${requiredFields.join(', ')}`;
        },
      },
    });
  };
}

export const User = createParamDecorator((data: any, ctx) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as UserDocument;
});
