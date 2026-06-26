import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../service/token/token.service';
import { Reflector } from '@nestjs/core';
import { TokenEnum } from '../enum/token.enum';
import { tokenTypeKey } from '../decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType = this.reflector.get(tokenTypeKey, context.getHandler());
    let req;
    let authorization = '';
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
      authorization = req.headers.authorization;
    } else if (context.getType() === 'rpc') {
      // req = context.switchToRpc().getData();
    } else if (context.getType() === 'ws') {
      // req = context.switchToRpc().getData();
    }
    if (!authorization) {
      throw new UnauthorizedException('missing authorization header');
    }
    const [prefix, token] = (authorization as string).split(' ');
    if (!token || !prefix) {
      throw new UnauthorizedException('invalid token format');
    }
    const { accessKey, refreshKey } = this.tokenService.getSignature(prefix);
    console.log(tokenType);

    const secret = tokenType === TokenEnum.access ? accessKey : refreshKey;
    const { user, decoded } = await this.tokenService.decodeUser(token, secret);
    req.user = user;
    req.decoded = decoded;
    return true;
  }
}
