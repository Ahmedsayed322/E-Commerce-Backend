import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'ValidId', async: false })
export class ValidId implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    if (typeof value === 'string') {
      return Types.ObjectId.isValid(value);
    }
    if (Array.isArray(value)) {
      return value.every((id) => Types.ObjectId.isValid(id));
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be an array of valid ObjectId`;
  }
}
