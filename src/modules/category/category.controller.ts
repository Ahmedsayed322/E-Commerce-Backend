import { Body, Controller, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloud } from '../../common/utils/multer/multer.utils';
import { createCategoryDto } from './dto/Category.dto';
import { User } from '../../common/decorators/user.decorator';
import {type UserDocument } from '../../DB/models/user.model';

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
}
