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
} from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';

@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  @Get()
  getAllReserves() {
    try {
      return this.reservesService.getAllReserves();
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
  getReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return this.reservesService.getReserve(reserveId);
  }

  @Get('date/:date/:idTable')
  getAllReservesByDate(
    @Param('date') date: string,
    @Param('idTable') idTable: string,
  ) {
    try {
      const [year, month, day] = date.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      return this.reservesService.getAllReservesByDate(
        formattedDate,
        parseInt(idTable),
      );
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  @Post()
  createReserve(@Body() createReserveDto: CreateReserveDto) {
    return this.reservesService.createReserve(createReserveDto);
  }

  @Put(':id')
  updateReserve(
    @Param('id') id: string,
    @Body() updateReserveDto: UpdateReserveDto,
  ) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return this.reservesService.updateReserve(updateReserveDto, reserveId);
  }

  @Delete(':id')
  deleteReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return this.reservesService.deleteReserve(reserveId);
  }
}
