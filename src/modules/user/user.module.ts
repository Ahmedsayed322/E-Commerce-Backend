import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { UserModel } from '../../DB/models/user.model';
import { UserRepo } from '../../repositories/user.repo';
import { SMTPService } from '../../common/service/smtp/smtp.service';
import { TokenService } from '../../common/service/JWT/JWT.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/service/redis/redis.service';
import { createClient } from 'redis';

@Module({
  imports: [UserModel],
  exports: [],
  providers: [
    UserService,
    UserRepo,
    SMTPService,
    TokenService,
    JwtService,
    RedisService,
  ],
  controllers: [UserController],
})
export class UserModule {}
