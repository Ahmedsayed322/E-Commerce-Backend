import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../service/token/token.service';
import { PrefixEnum } from '../enum/prefix.enum';
@Injectable()
export class auth implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException('missing authorization header');
    }
    const [prefix, token] = (authorization as string).split(' ');
    if (!token || !prefix) {
      throw new UnauthorizedException('invalid token format');
    }
    const { accessKey, refreshKey } = this.tokenService.getSignature(prefix);
    const secret = accessKey ? accessKey : refreshKey;

    const { user, decoded } = await this.tokenService.decodeUser(token, secret);
    req.user = user;
    req.decoded = decoded;

    next();
  }
}
