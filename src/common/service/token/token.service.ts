import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

import { Types } from 'mongoose';
import { PrefixEnum } from '../../enum/prefix.enum';
import { TokenEnum } from '../../enum/token.enum';
import { Request } from 'express';
import { UserRepo } from '../../../repositories/user.repo';
export interface TokenPayload extends JwtPayload {
  id: Types.ObjectId;
  email: string;
}
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userRepo: UserRepo,
  ) {}
  generateAccessToken = async (
    id: Types.ObjectId,
    email: string,
    jti: string,
  ): Promise<string> => {
    return await this.jwt.signAsync(
      { id, email },
      { privateKey: process.env.JWT_ACCESS_KEY!, jwtid: jti, expiresIn: '30m' },
    );
  };
  generateRefreshToken = async (
    id: Types.ObjectId,
    email: string,
    jti: string,
  ): Promise<string> => {
    return await this.jwt.signAsync(
      { id, email },
      { privateKey: process.env.JWT_REFRESH_KEY!, jwtid: jti, expiresIn: '7d' },
    );
  };
  verifyToken = async (
    token: string,
    secret: string,
  ): Promise<TokenPayload> => {
    try {
      return await this.jwt.verifyAsync(token, {
        publicKey: secret,
      });
    } catch (error: any) {
      switch (error.name) {
        case 'TokenExpiredError':
          throw new UnauthorizedException({
            message: 'access Token expired',
            error: error.name,
            statusCode: HttpStatus.UNAUTHORIZED,
          });
        default:
          throw new UnauthorizedException({
            message: 'invalid signature',
            error: error.name,
            statusCode: HttpStatus.UNAUTHORIZED,
          });
      }
    }
  };

  getSignature = (prefix: string) => {
    let accessKey;
    let refreshKey;
    if (prefix === PrefixEnum.user) {
      accessKey = process.env.JWT_ACCESS_KEY;
      refreshKey = process.env.JWT_REFRESH_KEY;
    } else {
      accessKey = process.env.JWT_ACCESS_TOKEN_ADMIN;
      refreshKey = process.env.JWT_REFRESH_TOKEN_ADMIN;
    }

    return { accessKey, refreshKey };
  };
  decodeUser = async (token: string, secret: string) => {
    const decoded = await this.verifyToken(token, secret);
    if (!decoded?.id) {
      throw new BadRequestException('invalid token');
    }
    const user = await this.userRepo.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    return { user, decoded };
  };
}
