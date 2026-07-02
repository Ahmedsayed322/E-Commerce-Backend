import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from '../../DB/models/category.model';
import { CategoryRepo } from '../../repositories/category.repo';
import { S3Service } from '../../common/service/s3/s3.service';
import { TokenService } from '../../common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepo } from '../../repositories/user.repo';
import { UserModel } from '../../DB/models/user.model';
import { BrandRepo } from '../../repositories/brand.repo';
import { BrandModel } from '../../DB/models/brand.model';

@Module({
  imports: [CategoryModel, UserModel, BrandModel],
  controllers: [CategoryController],
  providers: [
    BrandRepo,
    CategoryService,
    CategoryRepo,
    S3Service,
    TokenService,
    JwtService,
    UserRepo,
  ],
})
export class CategoryModule {}
