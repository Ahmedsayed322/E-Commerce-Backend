import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/user.dto';

import { UserRepo } from '../../repositories/user.repo';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { decrypt, encrypt } from '../../common/utils/security/encrypt.service';
import { compare, hash } from '../../common/utils/security/hash.service';
import { UserDocument } from '../../DB/models/user.model';
import { SMTPService } from '../../common/service/smtp/smtp.service';
import { randomInt, randomUUID } from 'crypto';
import { TokenService } from '../../common/service/token/token.service';
import { RedisService } from '../../common/service/redis/redis.service';
import { eventEmitter } from '../../common/service/smtp/email.event';
import { EventsEnum } from '../../common/enum/events.enum';
import { S3Service } from '../../common/service/s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    private s3: S3Service,
    private _userModel: UserRepo,
    private smtp: SMTPService,
    private jwt: TokenService,
    private redis: RedisService,
  ) {}
  //helpers
  async generateTokens(user: UserDocument) {
    console.log(user.role);

    const Jti = randomUUID();
    const accessToken =
      user.role === 'admin'
        ? await this.jwt.generateAccessToken(
            user._id,
            user.email,
            Jti,
            process.env.JWT_ACCESS_TOKEN_ADMIN!,
          )
        : await this.jwt.generateAccessToken(
            user._id,
            user.email,
            Jti,
            process.env.JWT_ACCESS_KEY!,
          );
    const refreshToken =
      user.role === 'admin'
        ? await this.jwt.generateRefreshToken(
            user._id,
            user.email,
            Jti,
            process.env.JWT_REFRESH_TOKEN_ADMIN!,
          )
        : await this.jwt.generateRefreshToken(
            user._id,
            user.email,
            Jti,
            process.env.JWT_REFRESH_KEY!,
          );
    return { accessToken, refreshToken };
  }
  //api services
  async createUser(body: CreateUserDto) {
    const { email, password, firstName, lastName, phone, gender } = body;
    const isExist = await this._userModel.findOne({
      email: body.email,
    });
    if (isExist) {
      throw new ConflictException('user already exists');
    }
    let user: UserDocument;
    console.log({ email });

    try {
      user = await this._userModel.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        gender,
      });
    } catch (e) {
      console.log(e);

      throw new BadRequestException('failed to create user');
    }
    const otp = randomInt(100000, 999999);
    eventEmitter.emit(EventsEnum.sendEmail, async () => {
      await this.smtp.sendOTP(user.email, 'otp', otp);
      await this.redis.setValue(this.redis.otpCodeKey(user.email), otp, {
        EX: 300,
      });
    });

    return successfulResponse('otp has been sent to your email', 201);
  }
  async login(body: LoginDto) {
    const { email, password } = body;
    const user = await this._userModel.findOne(
      { email },
      { password: 1, email: 1,role:1 },
    );
    if (!user) {
      throw new UnauthorizedException('invalid email/password');
    }
    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('invalid email/password');
    }
    const tokens = await this.generateTokens(user);
    return successfulResponse('user loggedIn', 200, {
      ...tokens,
    });
  }
  async uploadFile(user: UserDocument, file: Express.Multer.File) {
    return await this.s3.uploadFile({
      file: file,
      baseFolder: 'users',
      subFolder: user._id,
      isDiskStorage: false,
      key: `${user._id}-${Date.now()}-pfp`,
    });
  }
}
