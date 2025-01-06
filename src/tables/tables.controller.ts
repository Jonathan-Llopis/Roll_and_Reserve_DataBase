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
}
