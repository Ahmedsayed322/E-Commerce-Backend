import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

import { Types } from 'mongoose';
interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}
@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}
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
  verifyAccessToken = async (token: string): Promise<TokenPayload> => {
    try {
      return await this.jwt.verifyAsync(token, {
        publicKey: process.env.JWT_ACCESS_KEY!,
      });
    } catch (error: any) {
      switch (error.name) {
        case 'TokenExpiredError':
          throw new UnauthorizedException('Access token has expired');
        default:
          throw new BadRequestException('Invalid token payload');
      }
    }
  };
  verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
    try {
      return await this.jwt.verifyAsync(token, {
        publicKey: process.env.JWT_REFRESH_KEY!,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      throw new BadRequestException('Invalid token payload');
    }
  };
}
