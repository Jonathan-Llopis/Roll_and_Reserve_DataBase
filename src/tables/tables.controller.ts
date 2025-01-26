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
  Res,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './tables.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  getAllTables() {
    try {
      return this.tablesService.getAllTables();
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
  getTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.getTable(tableId);
  }

  @Get('/shop/:idShop')
  getAllTablesByShop(@Param('idShop') idShop: string) {
    try {
      return this.tablesService.getAllTablesByShop(parseInt(idShop));
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

  @Post()
  createTable(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.createTable(createTableDto);
  }

  @Put(':id')
  updateTable(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.updateTable(updateTableDto, tableId);
  }

  @Delete(':id')
  deleteTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.deleteTable(tableId);
  }

  @Post('qr')
  generate_qr(@Body() body: { table_items: number[] }, @Res() res: any) {
    const { table_items } = body;
    if (
      !Array.isArray(table_items) ||
      table_items.some((item) => isNaN(item))
    ) {
      console.error('Invalid table_items:', table_items);
      return res.status(400).send('Invalid table_items');
    }
    const inventoryIdItems = table_items;
    return this.tablesService.generate_qr(inventoryIdItems, res);
  }
}
