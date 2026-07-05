import { PartialType } from '@nestjs/mapped-types';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { AtLeastOne } from '../../../common/decorators/brand.decorator';
import { Transform } from 'class-transformer';

export class createBrandDto {
  @IsString()
  @Length(2, 50)
  name: string;
  @IsString()
  @Length(2, 500)
  description?: string;
}
@AtLeastOne(['name', 'description'])
export class updateBrandDto extends PartialType(createBrandDto) {}
export class QueryDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number;
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number;
  @IsString()
  @IsOptional()
  search?: string;
}
export class MongoIdDto {
  @IsMongoId()
  id: string;
}
