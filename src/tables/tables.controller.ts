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
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Table created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })

  /**
   * Create a new table
   * Method: POST /tables
   * Description: Create a new table
   * Input Parameters:
   * - `number_table` (number, required): The number assigned to the table
   * - `shop_id` (number, required): The unique identifier of the shop
   * Example Request (JSON format):
   * {
   *   "number_table": 5,
   *   "shop_id": 10
   * }
   * HTTP Responses:
   * - `201 Created`: {
   *     "id_table": 1,
   *     "number_table": 5,
   *     "tables_of_shop": {
   *       "id_shop": 10,
   *       ...
   *     }
   *   }
   * - `400 Bad Request`: Invalid data
   * - `401 Unauthorized`: Unauthorized
   */
  createTable(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.createTable(createTableDto);
  }

  @Post('qr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR code for table items' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table items.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  /**
   * Generate QR code for table items
   * Method: POST /tables/qr
   * Description: Generate QR code for table items
   * Input Parameters:
   * - `table_items` (array of numbers, required): Array of table item IDs
   * Example Request (JSON format):
   * {
   *   "table_items": [1, 2, 3]
   * }
   * HTTP Responses:
   * - `201 Created`: QR code generated successfully.
   * - `400 Bad Request`: Invalid table_items
   * - `401 Unauthorized`: Unauthorized
   * - `404 Not Found`: Tables not found
   */
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

  @Put(':id')
  @ApiOperation({ summary: 'Update table by ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID or data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  /**
   * Update table by ID
   * Method: PUT /tables/:id
   * Description: Update table by ID
   * Input Parameters:
   * - `id` (string, required): ID of the table
   * - `updateTableDto` (object, required):
   *   - `number_table` (number, optional): The number assigned to the table
   *   - `shop_id` (number, optional): The unique identifier of the shop
   * Example Request (JSON format):
   * {
   *   "number_table": 10,
   *   "shop_id": 1
   * }
   * HTTP Responses:
   * - `200 OK`: Table updated successfully.
   * - `400 Bad Request`: Invalid table ID or data.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Table not found.
   */
  updateTable(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.updateTable(updateTableDto, tableId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Get all tables
   * Method: GET /tables
   * Description: Get all tables
   * HTTP Responses:
   * - `200 OK`: Tables retrieved successfully.
   * - `204 No Content`: No content.
   * - `400 Bad Request`: Bad request.
   * - `401 Unauthorized`: Unauthorized.
   */
  getAllTables() {
    return this.tablesService.getAllTables();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  /**
   * Get table by ID
   * Method: GET /tables/:id
   * Description: Get table by ID
   * Input Parameters:
   * - `id` (string, required): ID of the table
   * HTTP Responses:
   * - `200 OK`: Table retrieved successfully.
   * - `400 Bad Request`: Invalid table ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Table not found.
   */
  getTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.getTable(tableId);
  }

  @Get('/shop/:idShop')
  @ApiOperation({ summary: 'Get all tables by shop ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'idShop', example: '1', description: 'ID of the shop' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 400, description: 'Invalid shop ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Retrieve all tables by shop ID.
   * Method: GET /tables/shop/:idShop
   * Description: Retrieves all tables associated with the specified shop ID.
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * HTTP Responses:
   * - `200 OK`: Tables retrieved successfully.
   * - `204 No Content`: No tables found for the given shop ID.
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   */
  getAllTablesByShop(@Param('idShop') idShop: string) {
    const shopId = parseInt(idShop);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.getAllTablesByShop(shopId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete table by ID' })
  @ApiParam({ name: 'id', example: '1', description: 'ID of the table' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid table ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  /**
   * Delete table by ID.
   * Method: DELETE /tables/:id
   * Description: Delete table by ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the table to delete.
   * HTTP Responses:
   * - `200 OK`: Table deleted successfully.
   * - `400 Bad Request`: Invalid table ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Table not found.
   */
  deleteTable(@Param('id') id: string) {
    const tableId = parseInt(id);
    if (isNaN(tableId)) {
      throw new HttpException('Invalid table ID', HttpStatus.BAD_REQUEST);
    }
    return this.tablesService.deleteTable(tableId);
  }
}
