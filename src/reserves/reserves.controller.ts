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
import { ReservesEntity } from './reserves.entity';

@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  @Get()
  getAllReserves() {
    return this.reservesService.getAllReserves();
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
    const [year, month, day] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    return this.reservesService.getAllReservesByDate(
      formattedDate,
      parseInt(idTable),
    );
  }

  @Post(':idShop')
  createReserve(
    @Body() createReserveDto: CreateReserveDto,
    @Param('idShop') idShop: string,
  ) {
    return this.reservesService.createReserve(createReserveDto, idShop);
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

  @Get('shop_events/:idShop')
  getAllUniqueShopEvents(
    @Param('idShop') shopId: string,
  ): Promise<ReservesEntity[]> {
    return this.reservesService.findAllUniqueShopEvents(shopId);
  }
}
