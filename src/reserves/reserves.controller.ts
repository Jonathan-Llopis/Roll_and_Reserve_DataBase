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
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservesService } from './reserves.service';
import { CreateReserveDto, UpdateReserveDto } from './reserves.dto';
import { ReservesEntity } from './reserves.entity';

@Controller('reserves')
export class ReservesController {
  constructor(private readonly reservesService: ReservesService) {}

  @Post(':idShop')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new reserve' })
  @ApiParam({ name: 'idShop', description: 'Shop ID', example: '1' })
  @ApiResponse({ status: 201, description: 'Reserve successfully created.' })
  @ApiResponse({ status: 400, description: 'Failed to create reserve.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Create a new reserve.
   * Method: POST /reserves/:idShop
   * Description: Create a new reserve for a given shop.
   * Input Parameters:
   * - `idShop` (string, required): Shop ID.
   * - `createReserveDto` (CreateReserveDto, required): Reserve data.
   * Example Request (JSON format):
   * {
   *   "total_places": 10,
   *   "reserver_id": "1",
   *   "hour_start": "2023-10-10T10:00:00Z",
   *   "hour_end": "2023-10-10T12:00:00Z",
   *   "description": "A fun board game event",
   *   "shop_event": true,
   *   "required_material": "Board game, dice, cards"
   * }
   * HTTP Responses:
   * - `201 Created`: Reserve successfully created.
   * - `400 Bad Request`: Failed to create reserve.
   * - `401 Unauthorized`: Unauthorized.
   */
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Reserve successfully updated.' })
  @ApiResponse({ status: 400, description: 'Failed to update reserve.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  /**
   * Update a reserve by ID.
   * Method: PUT /reserves/:id
   * Description: Update a reserve with the given ID.
   * Input Parameters:
   * - `id` (string, required): Reserve ID.
   * - `updateReserveDto` (UpdateReserveDto, required): Reserve data.
   * Example Request (JSON format):
   * {
   *   "total_places": 10,
   *   "reserver_id": "1",
   *   "hour_start": "2023-10-10T10:00:00Z",
   *   "hour_end": "2023-10-10T12:00:00Z",
   *   "description": "A fun board game event",
   *   "shop_event": true,
   *   "required_material": "Board game, dice, cards"
   * }
   * HTTP Responses:
   * - `200 OK`: Reserve successfully updated.
   * - `400 Bad Request`: Failed to update reserve.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Reserve not found.
   */
  async updateReserve(
    @Param('id') id: string,
    @Body() updateReserveDto: UpdateReserveDto,
  ) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.updateReserve(
      updateReserveDto,
      reserveId,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reserves' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all reserves.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve reserves.' })
  /**
   * Retrieve all reserves.
   * Method: GET /reserves
   * Description: Get all reserves.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved all reserves.
   * - `204 No Content`: No content.
   * - `401 Unauthorized`: Unauthorized.
   * - `400 Bad Request`: Failed to retrieve reserves.
   */
  async getAllReserves() {
    return await this.reservesService.getAllReserves();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the reserve.',
  })
  @ApiResponse({ status: 400, description: 'Invalid reserve ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  /**
   * Get a reserve by ID.
   * Method: GET /reserves/:id
   * Description: Get a reserve with the given ID.
   * Input Parameters:
   * - `id` (string, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the reserve.
   * - `400 Bad Request`: Invalid reserve ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Reserve not found.
   */
  async getReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.getReserve(reserveId);
  }

  @Get('date/:date/:idTable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reserves by date and table ID' })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2023-10-01',
  })
  @ApiParam({ name: 'idTable', description: 'Table ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all reserves by date and table ID.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve reserves by date and table ID.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Retrieve all reserves by date and table ID.
   * Method: GET /reserves/date/:date/:idTable
   * Description: Get all reserves by date and table ID.
   * Input Parameters:
   * - `date` (string, required): Date in YYYY-MM-DD format.
   * - `idTable` (string, required): Table ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved all reserves by date and table ID.
   * - `204 No Content`: No content.
   * - `400 Bad Request`: Failed to retrieve reserves by date and table ID.
   * - `401 Unauthorized`: Unauthorized.
   */
  async getAllReservesByDate(
    @Param('date') date: string,
    @Param('idTable') idTable: string,
  ) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new HttpException(
        'Invalid date format. Expected YYYY-MM-DD',
        HttpStatus.BAD_REQUEST,
      );
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

  @Get('shop_events/:idShop')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all unique shop events by shop ID' })
  @ApiParam({ name: 'idShop', description: 'Shop ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all unique shop events.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve unique shop events.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  /**
   * Retrieve all unique shop events by shop ID.
   * Method: GET /reserves/shop_events/:idShop
   * Description: Get all unique shop events by shop ID.
   * Input Parameters:
   * - `idShop` (string, required): Shop ID.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved all unique shop events.
   *   Example response:
   *   [
   *     {
   *       id_reserve: 1,
   *       total_places: 10,
   *       reserver_id: '1',
   *       hour_start: '2023-10-10T10:00:00Z',
   *       hour_end: '2023-10-10T12:00:00Z',
   *       description: 'Test description',
   *       required_material: 'Board game, dice, cards',
   *       shop_event: true,
   *       event_id: 'event-1',
   *       confirmation_notification: false,
   *       difficulty: null,
   *       reserve_of_game: null,
   *       reserve_table: { id_table: 1 },
   *       users_in_reserve: [],
   *       userReserves: [],
   *     },
   *     ...
   *   ]
   * - `400 Bad Request`: Failed to retrieve unique shop events.
   * - `401 Unauthorized`: Unauthorized.
   */
  async getAllUniqueShopEvents(
    @Param('idShop') idShop: string,
  ): Promise<ReservesEntity[]> {
    const shopId = parseInt(idShop);
    if (isNaN(shopId)) {
      throw new HttpException('Invalid shop ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.findAllUniqueShopEvents(shopId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reserve by ID' })
  @ApiParam({ name: 'id', description: 'Reserve ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Reserve successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Failed to delete reserve.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Reserve not found.' })
  /**
   * Delete a reserve by ID.
   * Method: DELETE /reserves/:id
   * Description: Delete a reserve with the given ID.
   * Input Parameters:
   * - `id` (string, required): Reserve ID.
   * HTTP Responses:
   * - `200 OK`: Reserve successfully deleted.
   * - `400 Bad Request`: Failed to delete reserve.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Reserve not found.
   */
  async deleteReserve(@Param('id') id: string) {
    const reserveId = parseInt(id);
    if (isNaN(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.deleteReserve(reserveId);
  }

  @Get('last_ten_players/:idGoogle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the last ten players for a user by Google ID' })
  @ApiParam({ name: 'idGoogle', description: 'Google ID', example: 'abc123' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the last ten players.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve players.' })
  /**
   * Get the last ten players for a user by Google ID.
   * Method: GET /reserves/last_ten_players/:idGoogle
   * Description: Retrieve the last ten players for a user given by their Google ID.
   * Input Parameters:
   * - `idGoogle` (string, required): Google ID of the user.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the last ten players.
   * - `204 No Content`: No content.
   * - `400 Bad Request`: Failed to retrieve players.
   * - `401 Unauthorized`: Unauthorized.
   */
  async getLastTenPlayers(@Param('idGoogle') idGoogle: string) {
    if (!idGoogle) {
      throw new HttpException('Invalid Google ID', HttpStatus.BAD_REQUEST);
    }
    return await this.reservesService.getLastTenPlayers(idGoogle);
  }
}
