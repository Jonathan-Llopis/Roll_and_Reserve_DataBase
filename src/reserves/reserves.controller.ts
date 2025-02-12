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
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReservesService } from './reserves.service';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { ReservesEntity } from './reserves.entity';

@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reserves' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all reserves.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve reserves.' })
  async getAllReserves() {
    return await this.reservesService.getAllReserves();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved the reserve.' })
  @ApiResponse({ status: 400, description: 'Invalid reserve ID.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  async getReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.getReserve(reserveId);
  }

  @Get('date/:date/:idTable')
  @ApiOperation({ summary: 'Get all reserves by date and table ID' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2023-10-01' })
  @ApiParam({ name: 'idTable', description: 'Table ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all reserves by date and table ID.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve reserves by date and table ID.' })
  async getAllReservesByDate(
    @Param('date') date: string,
    @Param('idTable') idTable: string,
  ) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new HttpException('Invalid date format. Expected YYYY-MM-DD', HttpStatus.BAD_REQUEST);
    }
    const tableId = parseInt(idTable);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    const [year, month, day] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    return await this.reservesService.getAllReservesByDate(
      formattedDate,
      tableId,
    );
  }

  @Post(':idShop')
  @ApiOperation({ summary: 'Create a new reserve' })
  @ApiParam({ name: 'idShop', description: 'Shop ID', example: '1' })
  @ApiResponse({ status: 201, description: 'Reserve successfully created.' })
  @ApiResponse({ status: 400, description: 'Failed to create reserve.' })
  async createReserve(
    @Body() createReserveDto: CreateReserveDto,
    @Param('idShop') idShop: string,
  ) {
    const shopId = parseInt(idShop);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.createReserve(createReserveDto, shopId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Reserve successfully updated.' })
  @ApiResponse({ status: 400, description: 'Failed to update reserve.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  async updateReserve(
    @Param('id') id: string,
    @Body() updateReserveDto: UpdateReserveDto,
  ) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.updateReserve(updateReserveDto, reserveId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Reserve successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Failed to delete reserve.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  async deleteReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.deleteReserve(reserveId);
  }

  @Get('shop_events/:idShop')
  @ApiOperation({ summary: 'Get all unique shop events by shop ID' })
  @ApiParam({ name: 'idShop', description: 'Shop ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all unique shop events.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve unique shop events.' })
  async getAllUniqueShopEvents(
    @Param('idShop') idShop: string,
  ): Promise<ReservesEntity[]> {
    const shopId = parseInt(idShop);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.findAllUniqueShopEvents(shopId);
  }
}
