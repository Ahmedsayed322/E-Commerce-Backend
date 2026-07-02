import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { createBrandDto, QueryDto, updateBrandDto } from './dto/brands.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloud } from '../../common/utils/multer/multer.utils';
import { Auth } from '../../common/decorators/auth.decorator';
import { RoleEnum } from '../../common/enum/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { type UserDocument } from '../../DB/models/user.model';

@Controller('api/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}
  @Post()
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('logo', multerCloud({ isDiskStorage: false })),
  )
  async createBrand(
    @Body() body: createBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument,
  ) {
    return await this.brandsService.createBrand(body, file, user);
  }
  @Patch(':id')
  @Auth([RoleEnum.admin])
  async updateBrand(
    @Body() body: updateBrandDto,
    @Param('id') id: string,

    @User() user: UserDocument,
  ) {
    return await this.brandsService.updateBrand(id, body, user);
  }
  @Patch(':id/logo')
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('updatedLogo', multerCloud({ isDiskStorage: false })),
  )
  async updateBrandLogo(
    @Param('id') id: string,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: UserDocument,
  ) {
    return await this.brandsService.updateBrandLogo(id, file, user);
  }
  @Get('')
  async getBrands(@Query() query: QueryDto) {
    return await this.brandsService.getBrands(query);
  }
}
