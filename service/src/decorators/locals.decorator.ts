import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Locals = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();

    return response.locals;
  },
);
