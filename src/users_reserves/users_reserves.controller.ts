import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { UsersReservesService } from './users_reserves.service';
import { ReservesEntity } from 'src/reserves/reserves.entity';

@Controller('users')
export class UsersReservesController {
  constructor(private readonly usersReservesService: UsersReservesService) {}

  @Post(':userId/reserves/:reserveId')
  async addReserveToUser(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    return this.usersReservesService.addReserveToUser(userId, reserveId);
  }

  @Put(':userId/reserves')
  async associateReserveToUser(
    @Body() reservesDto: ReservesEntity[],
    @Param('userId') userId: string,
  ) {
    return this.usersReservesService.updateReservesFromUser(
      userId,
      reservesDto,
    );
  }

  @Delete(':userId/reserves/:reserveId')
  @HttpCode(204)
  async deleteReserveFromUser(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersReservesService.deleteReserveFromUser(userId, reserveId);
  }

  @Get(':userId/reserves/:reserveId')
  async findReserveByUserIdReserveId(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersReservesService.findReserveFromUser(userId, reserveId);
  }

  @Get(':userId/reserves')
  async findReservesByUserId(@Param('userId') userId: string) {
    if (isEmpty(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersReservesService.findReservesFromUser(userId);
  }
}
