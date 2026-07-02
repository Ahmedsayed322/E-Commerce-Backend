import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class createProductDto {
  @IsString()
  @Length(2, 50)
  title: string;
  @IsString()
  @Length(25, 2000)
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  stock: number;
  @IsMongoId()
  @IsOptional()
  brand?: string;
  @IsMongoId()
  category: string;
}
// @AtLeastOne(['name', 'description'])
// export class updateBrandDto extends PartialType(createBrandDto) {}
// export class QueryDto {
//   @IsNumber()
//   @IsPositive()
//  @Type(() => Number)//   @IsOptional()
//   page?: number;
//   @IsNumber()
//   @IsPositive()
//  @Type(() => Number)//   @IsOptional()
//   limit?: number;
//   @IsString()
//   @IsOptional()
//   search?: string;
// }
