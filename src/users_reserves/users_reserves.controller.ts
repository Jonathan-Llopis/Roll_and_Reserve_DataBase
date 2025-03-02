import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { UsersReservesService } from './users_reserves.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('ReservesUsers')
@Controller('users')
export class UsersReservesController {
  constructor(private readonly usersReservesService: UsersReservesService) {}

  private validateReserveId(reserveId: string) {
    if (isNaN(Number(reserveId))) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a reserve to a user' })
  @ApiResponse({
    status: 201,
    description: 'Reserve successfully added to user.',
  })
  @ApiResponse({
    status: 404,
    description: 'The user or reserve with the given id was not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
  async addReserveToUser(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    this.validateReserveId(reserveId);

    return await this.usersReservesService.addUsertoReserve(
      userId,
      reserveId,
      false,
    );
  }

  @Put(':userId/reserves/:reserveId/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a reserve for a user' })
  @ApiResponse({ status: 200, description: 'Reserve successfully confirmed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
  async confirmReserve(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateReserveId(reserveId);

    return await this.usersReservesService.confirmReserveForUser(
      userId,
      reserveId,
    );
  }

  @Get('reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a reserve by ID' })
  @ApiResponse({ status: 200, description: 'Reserve found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid reserve ID.' })
  @ApiParam({ name: 'reserveId', example: '456' })
  async findReserveById(@Param('reserveId') reserveId: string) {
    if (isEmpty(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    this.validateReserveId(reserveId);
    return await this.usersReservesService.findReserveById(reserveId);
  }

  @Get(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a reserve by user ID and reserve ID' })
  @ApiResponse({ status: 200, description: 'Reserve found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
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
    this.validateReserveId(reserveId);
    return await this.usersReservesService.findReserveFromUser(
      userId,
      reserveId,
    );
  }

  @Get(':userId/reserves')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all reserves by user ID' })
  @ApiResponse({ status: 200, description: 'Reserves found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The user with the given id was not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  async findReservesByUserId(@Param('userId') userId: string) {
    if (isEmpty(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    } else {
      return await this.usersReservesService.findReservesFromUser(userId);
    }
  }

  @Delete(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reserve from a user' })
  @ApiResponse({
    status: 204,
    description: 'Reserve successfully deleted from user.',
  })
  @ApiResponse({
    status: 404,
    description: 'The user or reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
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
    this.validateReserveId(reserveId);

    return await this.usersReservesService.deleteReserveFromUser(
      userId,
      reserveId,
    );
  }
}
