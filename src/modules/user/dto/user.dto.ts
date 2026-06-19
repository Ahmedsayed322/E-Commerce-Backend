import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from '../../../common/decorators/user.decorator';
import { GenderEnum } from '../../../common/enum/gender.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 21)
  firstName: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 21)
  lastName: string;
  @IsMobilePhone()
  phone: string;
  @ValidateIf((object: CreateUserDto, val) => Boolean(object.password))
  @IsMatch(['password'])
  cPassword: string;
  @IsEnum(GenderEnum)
  gender: string;
}
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

// import * as z from 'zod';

// export const signUpValidation = z
//   .strictObject({
//     email: z.email(),
//     password: z.string(),
//     cPassword: z.string(),
//   })
//   .superRefine((args, ctx) => {
//     if (args.password !== args.cPassword) {
//       return ctx.addIssue({
//         code: 'custom',
//         path: ['cPassword'],
//         message: 'passwords does not match',
//       });
//     }
//   });
// export type signUpDto = z.infer<typeof signUpValidation>;
