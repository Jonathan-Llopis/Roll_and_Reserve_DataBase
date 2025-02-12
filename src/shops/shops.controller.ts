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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not create shop',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shop by ID' })
  @ApiParam({ name: 'id', description: 'ID of the shop', type: String, example: '1' })
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not update shop',
        },
        HttpStatus.BAD_REQUEST,
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not retrieve shops',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiParam({ name: 'id', description: 'ID of the shop', type: String, example: '1' })
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not retrieve shop',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/owner/:idOwner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shops by owner ID' })
  @ApiParam({ name: 'idOwner', description: 'ID of the owner', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  getAllShopsByOwner(@Param('idOwner') idOwner: string) {
    try {
      return this.shopsService.getAllShopsByOwner(idOwner);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not retrieve shops by owner',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shop by ID' })
  @ApiParam({ name: 'id', description: 'ID of the shop', type: String, example: '1' })
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Could not delete shop',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
