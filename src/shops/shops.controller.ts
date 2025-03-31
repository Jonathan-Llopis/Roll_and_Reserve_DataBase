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
  /**
   * Create a new shop.
   * Method: POST /shops
   * Description: Create a new shop with the given information.
   * Input Parameters:
   * - `name` (string, required): The name of the shop.
   * - `address` (string, required): The address of the shop.
   * - `logo` (string, required): The logo of the shop.
   * - `latitud` (number, required): The latitude of the shop location.
   * - `longitud` (number, required): The longitude of the shop location.
   * - `owner_id` (string, required): The ID of the shop owner.
   * Example Request (JSON format):
   * {
   *   "name": "My Shop",
   *   "address": "123 Main St",
   *   "logo": "logo.png",
   *   "latitud": 40.7128,
   *   "longitud": -74.006,
   *   "owner_id": "123"
   * }
   * HTTP Responses:
   * - `201 Created`: The shop was created successfully.
   *   - Example response:
   *     {
   *       "id_shop": 1,
   *       "name": "My Shop",
   *       "address": "123 Main St",
   *       "logo": "logo.png",
   *       "latitud": 40.7128,
   *       "longitud": -74.006,
   *       "owner": {
   *         "id_user": 1,
   *         "id_google": "123",
   *         "username": "Owner",
   *         "name": "Owner Name",
   *         "password": "hashed_password",
   *         "email": "owner@example.com",
   *         "shop_owned": [],
   *         "role": 1,
   *         "tokenExpiration": "2023-01-01T00:00:00.000Z",
   *         "token": "mockToken",
   *         "avatar": "mockAvatar.png"
   *       }
   *     }
   * - `400 Bad Request`: The request body was invalid.
   * - `401 Unauthorized`: The user is not logged in.
   */
  createShop(@Body() createShopDto: CreateShopDto) {
    try {
      return this.shopsService.createShop(createShopDto);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
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
  /**
   * Method: PUT /shops/:id
   * Description: Updates a shop by ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the shop.
   * - `updateShopDto` (UpdateShopDto, required): The updated shop data.
   * Example Request (JSON format):
   * {
   *   "name": "Updated Shop",
   *   "address": "Updated Address",
   *   "logo": "updatedLogo.png",
   *   "latitud": 40.7128,
   *   "longitud": -74.006,
   *   "owner_id": "123"
   * }
   * HTTP Responses:
   * - `200 OK`: Shop updated successfully.
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The shop with the given ID was not found.
   */
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
       'Bad Request',
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
  /**
   * Retrieves all shops.
   * Method: GET /shops
   * HTTP Responses:
   * - `200 OK`: Shops retrieved successfully.
   *   Example response:
   *   [
   *     {
   *       id_shop: 1,
   *       name: 'Shop 1',
   *       address: 'Address 1',
   *       logo: 'logo.png',
   *       latitud: 40.7128,
   *       longitud: -74.006,
   *       owner: {
   *         id_google: '1234567890',
   *         name: 'John Doe',
   *         email: 'john.doe@example.com',
   *       },
   *       games: [],
   *       tables_in_shop: [],
   *       reviews_shop: [],
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No shops found.
   * - `400 Bad Request`: Bad request.
   * - `401 Unauthorized`: Unauthorized access.
   */
  getAllShops() {
    try {
      return this.shopsService.getAllShops();
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
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
  /**
   * Retrieves a shop by ID.
   * Method: GET /shops/:id
   * Input Parameters:
   * - `id` (string, required): The ID of the shop.
   * HTTP Responses:
   * - `200 OK`: Shop retrieved successfully.
   *   Example response:
   *   {
   *     id_shop: 1,
   *     name: 'Shop 1',
   *     address: 'Address 1',
   *     logo: 'logo.png',
   *     latitud: 40.7128,
   *     longitud: -74.006,
   *     owner: {
   *       id_google: '1234567890',
   *       name: 'John Doe',
   *       email: 'john.doe@example.com',
   *     },
   *     games: [],
   *     tables_in_shop: [],
   *     reviews_shop: [],
   *   }
   * - `400 Bad Request`: Invalid shop ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Shop not found.
   */
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
       'Bad Request',
        HttpStatus.BAD_REQUEST,
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
  /**
   * Retrieves all shops by the owner ID.
   * Method: GET /shops/owner/:idOwner
   * Description: Retrieves all shops by the owner ID.
   * Input Parameters:
   * - `idOwner` (string, required): The ID of the owner.
   * Example Request (JSON format): None
   * HTTP Responses:
   * - `200 OK`: Shops retrieved successfully. Example: [ { "id_shop": 1, "name": "Shop 1", ... }, ... ]
   * - `204 No Content`: No shops found for the given owner ID.
   * - `400 Bad Request`: Bad request.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Owner not found.
   */
  getAllShopsByOwner(@Param('idOwner') idOwner: string) {
    try {
      return this.shopsService.getAllShopsByOwner(idOwner);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
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
/**
 * Method: DELETE /shops/:id
 * Description: Deletes a shop by ID.
 * Input Parameters:
 * - `id` (string, required): The ID of the shop.
 * HTTP Responses:
 * - `200 OK`: Shop deleted successfully.
 * - `400 Bad Request`: Invalid shop ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: The shop with the given ID was not found.
 */

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
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('/shop/:idShop/stats/most-played-games')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get most played games by shop ID within a time range',
  })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
/**
 * Method: POST /shops/:idShop/stats/most-played-games
 * Description: Retrieves most played games by shop ID within a time range.
 * Input Parameters:
 * - `idShop` (string, required): The ID of the shop.
 * - `startTime` (string, required): The start time of the range in ISO 8601.
 * - `endTime` (string, required): The end time of the range in ISO 8601.
 * HTTP Responses:
 * - `200 OK`: Statistics retrieved successfully. Example:
 *   [
 *     {
 *       "id_game": 1,
 *       "name": "Chess",
 *       "play_count": 5
 *     },
 *     {
 *       "id_game": 2,
 *       "name": "Poker",
 *       "play_count": 3
 *     }
 *   ]
 * - `400 Bad Request`: Invalid shop ID, or invalid time range.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: The shop with the given ID was not found.
 */
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
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/shop/:idShop/stats/total-reservations')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get total reservations by shop ID within a time range',
  })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
/**
 * Get total reservations by shop ID within a time range.
 * Method: POST /shop/:idShop/stats/total-reservations
 * Description: Retrieves the total number of reservations made for a specific shop
 * within the provided start and end time.
 * Input Parameters:
 * - `idShop` (string, required): The ID of the shop.
 * - `startTime` (string, required): The start time of the period.
 * - `endTime` (string, required): The end time of the period.
 * HTTP Responses:
 * - `200 OK`: Total reservations retrieved successfully.
 * - `400 Bad Request`: Invalid request data.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Shop not found.
 */

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
       'Bad Request',
        HttpStatus.BAD_REQUEST,
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
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
/**
 * Get the total number of distinct players who have made a reservation
 * for a specific shop within the provided start and end time.
 * Method: POST /shop/:idShop/stats/player-count
 * Description: Retrieves the total number of distinct players who have made a
 * reservation for a specific shop within the provided start and end time.
 * Input Parameters:
 * - `idShop` (string, required): The ID of the shop.
 * - `startTime` (string, required): The start time of the period.
 * - `endTime` (string, required): The end time of the period.
 * HTTP Responses:
 * - `200 OK`: Player count retrieved successfully.
 * - `400 Bad Request`: Invalid request data.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Shop not found.
 */
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
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/shop/:idShop/stats/peak-reservation-hours')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get peak reservation hours by shop ID within a time range',
  })
  @ApiParam({
    name: 'idShop',
    description: 'ID of the shop',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
/**
 * Get the peak reservation hours for a specific shop within the provided
 * start and end time.
 * Method: POST /shop/:idShop/stats/peak-reservation-hours
 * Description: Retrieves the peak reservation hours for a specific shop
 * within the provided start and end time.
 * Input Parameters:
 * - `idShop` (string, required): The ID of the shop.
 * - `startTime` (string, required): The start time of the period.
 * - `endTime` (string, required): The end time of the period.
 * HTTP Responses:
 * - `200 OK`: Statistics retrieved successfully.
 * - `400 Bad Request`: Invalid request data.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: Shop not found.
 */
  getPeakReservationHours(
    @Param('idShop') idShop: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    try {
      return this.shopsService.getPeakReservationHours(
        idShop,
        startTime,
        endTime,
      );
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException(
       'Bad Request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
