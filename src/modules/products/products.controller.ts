import {
  Body,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { multerCloud } from '../../common/utils/multer/multer.utils';
import { Auth } from '../../common/decorators/auth.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { createProductDto } from './dto/product.dto';
import { User } from '../../common/decorators/user.decorator';
import type { UserDocument } from '../../DB/models/user.model';

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
   

    return await this.productsService.createProduct(body, user, files);
  }
}
