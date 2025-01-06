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
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto } from './shops.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  getAllShops() {
    try {
      return this.shopsService.getAllShops();
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
  getShop(@Param('id') id: string) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.shopsService.getShop(shopId);
  }

  @Post()
  createShop(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.createShop(createShopDto);
  }

  @Put(':id')
  updateShop(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.shopsService.updateShop(updateShopDto, shopId);
  }

  @Delete(':id')
  deleteShop(@Param('id') id: string) {
    const shopId = parseInt(id);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.shopsService.deleteShop(shopId);
  }
}
