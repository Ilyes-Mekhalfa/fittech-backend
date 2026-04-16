import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAnnex = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();    
    const annex = request.user as any;
    return data ? annex?.[data] : annex;
  },
);
