import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';

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
}
