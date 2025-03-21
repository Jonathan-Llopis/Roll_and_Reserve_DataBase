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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto } from './shops.dto';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop' })
  @ApiResponse({ status: 201, description: 'Shop created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createShop(@Body() createShopDto: CreateShopDto) {
    try {
      return this.shopsService.createShop(createShopDto);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shop by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Shop updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  updateShop(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.shopsService.updateShop(updateShopDto, shopId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getAllShops() {
    try {
      return this.shopsService.getAllShops();
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Shop retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  getShop(@Param('id') id: string) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.shopsService.getShop(shopId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/owner/:idOwner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shops by owner ID' })
  @ApiParam({
    name: 'idOwner',
    description: 'ID of the owner',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  getAllShopsByOwner(@Param('idOwner') idOwner: string) {
    try {
      return this.shopsService.getAllShopsByOwner(idOwner);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shop by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Shop deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  deleteShop(@Param('id') id: string) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.shopsService.deleteShop(shopId);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('/shop/:idShop/stats/most-played-games')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get most played games by shop ID within a time range' })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  getMostPlayedGames(
    @Param('idShop') idShop: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    try {
      return this.shopsService.getMostPlayedGames(idShop, startTime, endTime);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/shop/:idShop/stats/total-reservations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total reservations by shop ID within a time range' })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  getTotalReservations(
    @Param('idShop') idShop: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    try {
      return this.shopsService.getTotalReservations(idShop, startTime, endTime);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/shop/:idShop/stats/player-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get player count by shop ID within a time range' })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  getPlayerCount(
    @Param('idShop') idShop: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    try {
      return this.shopsService.getPlayerCount(idShop, startTime, endTime);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/shop/:idShop/stats/peak-reservation-hours')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get peak reservation hours by shop ID within a time range' })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  getPeakReservationHours(
    @Param('idShop') idShop: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    try {
      return this.shopsService.getPeakReservationHours(idShop, startTime, endTime);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
