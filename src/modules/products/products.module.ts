import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepo } from '../../repositories/product.repo';
import { UserModel } from '../../DB/models/user.model';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../common/service/token/token.service';
import { ProductModel } from '../../DB/models/product.model';
import { UserRepo } from '../../repositories/user.repo';
import { CategoryRepo } from '../../repositories/category.repo';
import { CategoryModel } from '../../DB/models/category.model';
import { BrandRepo } from '../../repositories/brand.repo';
import { BrandModel } from '../../DB/models/brand.model';
import { S3Service } from '../../common/service/s3/s3.service';

@Module({
  imports: [ProductModel, UserModel, CategoryModel, BrandModel],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    UserRepo,
    CategoryRepo,
    ProductRepo,
    JwtService,
    TokenService,
    BrandRepo,
    S3Service,
  ],
})
export class ProductsModule {}
