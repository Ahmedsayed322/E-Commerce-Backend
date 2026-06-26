import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TokenService } from '../service/token/token.service';
import { Reflector } from '@nestjs/core';
import { rolesKey } from '../decorators/auth.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      (this.reflector.get(rolesKey, context.getHandler()) as string[]) || [];
    let req;
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else if (context.getType() === 'rpc') {
      // req = context.switchToRpc().getData();
    } else if (context.getType() === 'ws') {
      // req = context.switchToRpc().getData();
    }

    if (!roles.includes(req.user?.role)) {
      throw new ForbiddenException('you are not allowed');
    }
    return true;
  }
}
