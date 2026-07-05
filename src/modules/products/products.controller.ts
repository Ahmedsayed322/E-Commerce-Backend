import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerCloud } from '../../common/utils/multer/multer.utils';
import { Auth } from '../../common/decorators/auth.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import {
  createProductDto,
  DeleteQueryDto,
  updateProductDto,
} from './dto/product.dto';
import { User } from '../../common/decorators/user.decorator';
import type { UserDocument } from '../../DB/models/user.model';
import { MongoIdDto } from '../brands/dto/brands.dto';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'sub_images', maxCount: 3 },
      ],
      multerCloud({ isDiskStorage: false }),
    ),
  )
  async createProduct(
    @Body() body: createProductDto,
    @User() user: UserDocument,
    @UploadedFiles()
    files: {
      main_image: Express.Multer.File[];
      sub_images: Express.Multer.File[];
    },
  ) {
    console.log(files);

    return await this.productsService.createProduct(body, user, files);
  }

  @Get()
  async getProducts(@Query() query: any) {
    return await this.productsService.getProducts(query);
  }

  @Get(':id')
  async getProductById(@Param() params: MongoIdDto) {
    return await this.productsService.getProductById(params.id);
  }

  @Patch(':id')
  @Auth([RoleEnum.admin])
  async updateProduct(
    @Param() params: MongoIdDto,
    @Body() body: updateProductDto,
    @User() user: UserDocument,
  ) {
    return await this.productsService.updateProduct(params.id, body, user);
  }

  @Patch(':id/images')
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'main_image', maxCount: 1 },
        { name: 'sub_images', maxCount: 3 },
      ],
      multerCloud({ isDiskStorage: false }),
    ),
  )
  async updateProductImages(
    @Param() params: MongoIdDto,
    @UploadedFiles()
    files: {
      main_image?: Express.Multer.File[];
      sub_images?: Express.Multer.File[];
    },
  ) {
    return await this.productsService.updateProductImages(params.id, files);
  }

  @Delete(':id')
  @Auth([RoleEnum.admin])
  async deleteProduct(
    @Param() params: MongoIdDto,
    @User() user: UserDocument,
    @Query() query: DeleteQueryDto,
  ) {
    return await this.productsService.deleteProduct(params.id, user, query);
  }
}
