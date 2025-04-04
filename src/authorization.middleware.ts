import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from './Autentication/auth.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  /**
   * Validates the token sent in the Authorization header of the request.
   * If the token is invalid or expired, throws an UnauthorizedException.
   * If the token is valid, calls next().
   * @param req The request object from Express.
   * @param res The response object from Express.
   * @param next The next function in the middleware chain.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    if (process.env.ENABLE_TOKEN_VALIDATION === 'true') {
      const token = req.headers['authorization'];

      if (!token) {
        throw new UnauthorizedException('Token no encontrado');
      }

      const tokenSplit = token!.split(' ')[1];

      const isValid = await this.authService.validateToken(tokenSplit);
      if (!isValid) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }
    next();
  }
}
