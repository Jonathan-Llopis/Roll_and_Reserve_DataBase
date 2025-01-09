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
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.deleteUser(userId);
  }
  @Post('login')
  async login(@Body('email') email: string) {
    if (!email) {
      throw new HttpException(
        'El nombre de usuario es obligatorio',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.usersService.validateUser(email);
    if (!user) {
      throw new HttpException(
        'Credenciales inválidas',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = await this.authService.generateToken(user.id_google);

    return { token };
  }
}
