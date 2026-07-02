import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { TokenEnum } from '../enum/token.enum';
import { RoleEnum } from '../enum/role.enum';
import { AuthenticationGuard } from '../Guards/authentication.guard';
import { AuthorizationGuard } from '../Guards/Authorization.guard';

export const tokenTypeKey = 'tokenType';
export const TokenType = (token: TokenEnum = TokenEnum.access) => {
  return SetMetadata(tokenTypeKey, token);
};
export const rolesKey = 'roles';
export const Roles = (Roles: RoleEnum[]) => {
  return SetMetadata(rolesKey, Roles);
};
export const Auth = (
  roles: RoleEnum[] = [RoleEnum.user],
  type: TokenEnum = TokenEnum.access,
) => {
  return applyDecorators(
    TokenType(type),
    Roles(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
};
