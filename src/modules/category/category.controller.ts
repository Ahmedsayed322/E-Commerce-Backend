import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloud } from '../../common/utils/multer/multer.utils';
import { createCategoryDto, updateCategoryDto } from './dto/Category.dto';
import { User } from '../../common/decorators/user.decorator';
import { type UserDocument } from '../../DB/models/user.model';
import { DeleteQueryDto } from '../products/dto/product.dto';
import { MongoIdDto } from '../brands/dto/brands.dto';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Post()
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('image', multerCloud({ isDiskStorage: false })),
  )
  async createCategory(
    @Body() body: createCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument,
  ) {
    return await this.categoryService.createCategory(body, file, user);
  }

  @Get()
  async getCategories(@Query() query: any) {
    return await this.categoryService.getCategories(query);
  }

  @Get(':id')
  async getCategoryById(@Param() params: MongoIdDto) {
    return await this.categoryService.getCategoryById(params.id);
  }

  @Patch(':id')
  @Auth([RoleEnum.admin])
  async updateCategory(
    @Param() params: MongoIdDto,
    @Body() body: updateCategoryDto,
    @User() user: UserDocument,
  ) {
    return await this.categoryService.updateCategory(params.id, body, user);
  }
  @Patch(':id/image')
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('image', multerCloud({ isDiskStorage: false })),
  )
  async updateCategoryImage(
    @Param() params: MongoIdDto,
    @UploadedFile(ParseFilePipe) image:Express.Multer.File,
    @User()
    user: UserDocument,
  ) {
    return await this.categoryService.updateCategoryImage(
      params.id,
      user,
      image,
    );
  }

  @Delete(':id')
  @Auth([RoleEnum.admin])
  async deleteCategory(
    @Param() params: MongoIdDto,
    @User() user: UserDocument,
    @Query() query: DeleteQueryDto,
  ) {
    return await this.categoryService.deleteCategory(params.id, user, query);
  }
}
