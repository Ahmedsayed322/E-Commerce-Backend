import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import type { Request } from 'express';
import { type UserDocument } from '../../DB/models/user.model';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { AuthenticationGuard } from '../../common/Guards/authentication.guard';
import { TokenEnum } from '../../common/enum/token.enum';
import { Auth, Roles, TokenType } from '../../common/decorators/auth.decorator';
import { AuthorizationGuard } from '../../common/Guards/Authorization.guard';
import { RoleEnum } from '../../common/enum/role.enum';
import { User } from '../../common/decorators/user.decorator';
import { ResponseInterceptors } from '../../common/interceptor/response.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { multerCloud } from '../../common/utils/multer/multer.utils';

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('signup')
  async createUser(
    @Body()
    body: CreateUserDto,
  ) {
    return await this.userService.createUser(body);
  }
  @Post('signin')
  async login(
    @Body()
    body: LoginDto,
  ) {
    return await this.userService.login(body);
  }
  @Get('profile')
  @Auth([RoleEnum.user], TokenEnum.access)
  @UseInterceptors(ResponseInterceptors)
  async getMyProfile(@User() user: UserDocument) {
    return successfulResponse('done', 200, {
      user: user,
    });
  }
  @Post('upload')
  @Auth()
  @UseInterceptors(
    ResponseInterceptors,
    FileInterceptor(
      'attachment',
      multerCloud({ isDiskStorage: false, dest: 'uploads/images' }),
    ),
  )
  async upload(
    @User() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.userService.uploadFile(user, file);
    return successfulResponse('image has uploaded successfully', 200, { url });
  }
}
