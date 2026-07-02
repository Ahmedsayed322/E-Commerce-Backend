import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { BrandRepo } from '../../repositories/brand.repo';
import { BrandModel } from '../../DB/models/brand.model';
import { S3Service } from '../../common/service/s3/s3.service';
import { AuthenticationGuard } from '../../common/Guards/authentication.guard';
import { AuthorizationGuard } from '../../common/Guards/Authorization.guard';
import { TokenService } from '../../common/service/token/token.service';
import { UserRepo } from '../../repositories/user.repo';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../../DB/models/user.model';

@Module({
  controllers: [BrandsController],
  imports: [BrandModel,UserModel],
  providers: [
    BrandsService,
    BrandRepo,
    S3Service,
    TokenService,
    JwtService,
    UserRepo,
  ],
})
export class BrandsModule {}
