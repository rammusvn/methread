import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: number;
  username: string;
  email: string;
  image: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const requet = ctx.switchToHttp().getRequest();
    return requet.user;
  },
);
