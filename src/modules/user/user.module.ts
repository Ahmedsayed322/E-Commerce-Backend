import { UserService } from './user.service';
import { UserController } from './user.controller';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserModel } from '../../DB/models/user.model';
import { UserRepo } from '../../repositories/user.repo';
import { SMTPService } from '../../common/service/smtp/smtp.service';
import { TokenService } from '../../common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/service/redis/redis.service';
import { S3Service } from '../../common/service/s3/s3.service';


@Module({
  imports: [UserModel],
  exports: [],
  providers: [
    S3Service,
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
// export class UserModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(auth)
//       .exclude({ path: 'api/user/signin', method: RequestMethod.POST })
//       .forRoutes(UserController);
//     // .forRoutes({ path: 'api/user/{*p}', method: RequestMethod.POST });
//   }
// }
