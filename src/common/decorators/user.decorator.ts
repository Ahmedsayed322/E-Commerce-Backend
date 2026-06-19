import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchKeys', async: false })
export class matchKeys implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return value === args.object?.[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} doesn't match ${args.constraints[0]}`;
  }
}
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsMatch(
  constraints: string[],

  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: constraints,
      options: validationOptions,
      validator: matchKeys,
    });
  };
}
