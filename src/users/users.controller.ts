import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AuthService } from '../Autentication/auth.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UsersService } from './users.service';
@Controller('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getAllUser(@Query('xml') xml?: string) {
    try {
      return this.usersService.getAllUser(xml);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  @Get(':id')
  getUser(@Param('id') id: string, @Query('xml') xml?: string) {
    const userId = id;
    if (!userId) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.getUser(userId, xml);
  }

  @Get('google/:id_google')
  getUserByGoogleId(
    @Param('id_google') idGoogle: string,
    @Query('xml') xml?: string,
  ) {
    if (!idGoogle) {
      throw new HttpException('Invalid Google user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.getUserByGoogleId(idGoogle, xml);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = id;
    if (!userId) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.updateUser(
      {
        ...updateUserDto,
        id_google: userId,
      },
      userId,
    );
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    const userId = id;

    return this.usersService.deleteUser(userId);
  }
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new HttpException(
        'El nombre de usuario y la contraseña son obligatorios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new HttpException(
        'Credenciales inválidas',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = await this.authService.generateToken(user.id_google);

    return { token };
  }

  @Put(':id/token')
  async updateTokenNotification(
    @Param('id') id: string,
    @Body('token_notificacion') tokenNotificacion: string,
  ) {
    if (!id || !tokenNotificacion) {
      throw new HttpException(
        'El ID del usuario y el token de notificación son obligatorios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.usersService.updateNotificationToken(
      id,
      tokenNotificacion,
    );
    if (!updatedUser) {
      throw new HttpException(
        'No se pudo actualizar el token de notificación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedUser;
  }
  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!id || !oldPassword || !newPassword) {
      throw new HttpException(
        'El ID del usuario, la contraseña antigua y la nueva contraseña son obligatorios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isOldPasswordValid = await this.usersService.validateUserPassword(
      id,
      oldPassword,
    );
    if (!isOldPasswordValid) {
      throw new HttpException(
        'La contraseña antigua no es válida',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const updatedUser = await this.usersService.updateUserPassword(
      id,
      newPassword,
    );
    if (!updatedUser) {
      throw new HttpException(
        'No se pudo actualizar la contraseña',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedUser;
  }
}
