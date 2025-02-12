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
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  getAllTables() {
    return this.tablesService.getAllTables();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  getTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.getTable(tableId);
  }

  @Get('/shop/:idShop')
  @ApiOperation({ summary: 'Get all tables by shop ID' })
  @ApiParam({ name: 'idShop', example: '1', description: 'ID of the shop' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID' })
  getAllTablesByShop(@Param('idShop') idShop: string) {
    const shopId = parseInt(idShop);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.getAllTablesByShop(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  @ApiResponse({ status: 201, description: 'Table created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  createTable(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.createTable(createTableDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update table by ID' })
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID or data.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  updateTable(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.updateTable(updateTableDto, tableId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete table by ID' })
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  deleteTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.deleteTable(tableId);
  }

  @Post('qr')
  @ApiOperation({ summary: 'Generate QR code for table items' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table items.' })
  @ApiResponse({ status: 404, description: 'Tables not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        table_items: {
          type: 'array',
          items: {
            type: 'number',
          },
          example: [1, 2, 3],
          description: 'Array of table item IDs',
        },
      },
    },
  })
  generate_qr(@Body() body: { table_items: number[] }, @Res() res: any) {
    const { table_items } = body;
    if (
      !Array.isArray(table_items) ||
      table_items.some((item) => isNaN(item))
    ) {
      return res.status(400).send('Invalid table_items');
    }
    return this.tablesService.generate_qr(table_items, res);
  }

}
