import { PartialType } from '@nestjs/mapped-types';
import {
  isArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import { AtLeastOne } from '../../../common/decorators/brand.decorator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { ValidId } from '../../../common/decorators/category.decorator';

export class createCategoryDto {
  @IsString()
  @Length(2, 50)
  name: string;
  @Validate(ValidId)
  @IsOptional()
  brands: string[];
}
// @AtLeastOne(['name', 'description'])
// export class updateCategoryDto extends PartialType(createCategoryDto) {}
// export class QueryDto {
//   @IsNumber()
//   @IsPositive()
//   @Transform(({ value }) => parseInt(value))
//   @IsOptional()
//   page?: number;
//   @IsNumber()
//   @IsPositive()
//   @Transform(({ value }) => parseInt(value))
//   @IsOptional()
//   limit?: number;
//   @IsString()
//   @IsOptional()
//   search?: string;
// }
