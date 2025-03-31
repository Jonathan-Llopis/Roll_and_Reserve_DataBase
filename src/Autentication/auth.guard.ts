import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  /**
   * Determines if a request can proceed based on token validation.
   * Extracts the token from the request headers and validates it using the AuthService.
   * Throws an UnauthorizedException if the token is missing, invalid, or expired.
   *
   * @param context - The execution context that provides details about the current request.
   * @returns A promise that resolves to true if the token is valid, otherwise throws an exception.
   */

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token no encontrado');
    const isValid = await this.authService.validateToken(token);
    if (!isValid) throw new UnauthorizedException('Token inválido o expirado');

    return true;
  }
}
