import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { setCookie } from 'noblox.js';

@Injectable()
export class CookieGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    if (req.cookies?.loginCookie) {
      try {
        const user = await setCookie(req.cookies.loginCookie);
        if (user) {
          req.user = user;
          req.cookie = req.cookies.loginCookie;
          return true;
        }
      } catch (err) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'Validation failed',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Validation failed',
      },
      HttpStatus.FORBIDDEN,
    );

    // const { statsSet } = await this.usersService.findOneById(request.user.id);
    // if (!statsSet) {
    //   throw new ConflictException();
    // }
    // return !!statsSet;
  }
}
