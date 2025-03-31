import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { UsersReservesService } from './users_reserves.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('ReservesUsers')
@Controller('users')
export class UsersReservesController {
  constructor(private readonly usersReservesService: UsersReservesService) {}

  /**
   * Checks if the given reserve ID is valid. If not, throws a HttpException
   * with a BAD_REQUEST status.
   * @param reserveId The reserve ID to validate.
   * @throws HttpException with a BAD_REQUEST status if the reserve ID is invalid.
   */
  private validateReserveId(reserveId: string) {
    if (isNaN(Number(reserveId))) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a reserve to a user' })
  @ApiResponse({
    status: 201,
    description: 'Reserve successfully added to user.',
  })
  @ApiResponse({
    status: 404,
    description: 'The user or reserve with the given id was not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })

  /**
   * Add a reserve to a user.
   * Method: POST /users/:userId/reserves/:reserveId
   * Description: Associates a reserve with a user, if both the user and reserve exist.
   * Input Parameters:
   * - `userId` (string, required): The ID of the user.
   * - `reserveId` (string, required): The ID of the reserve.
   * Example Request (JSON format):
   * {
   *   "userId": "123",
   *   "reserveId": "456"
   * }
   * HTTP Responses:
   * - `201 Created`: Reserve successfully added to user.
   * - `400 Bad Request`: Invalid user or reserve ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: User or reserve not found.
   */

  async addReserveToUser(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    this.validateReserveId(reserveId);

    return await this.usersReservesService.addUsertoReserve(
      userId,
      reserveId,
      false,
    );
  }

  @Put(':userId/reserves/:reserveId/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a reserve for a user' })
  @ApiResponse({ status: 200, description: 'Reserve successfully confirmed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
/**
 * Confirms a reserve for a specific user.
 * Method: PUT /users/:userId/reserves/:reserveId/confirm
 * Description: Marks a reserve as confirmed for a user, if the reserve is 
 * associated with the user and both the user and reserve exist.
 * Input Parameters:
 * - `userId` (string, required): The ID of the user.
 * - `reserveId` (string, required): The ID of the reserve.
 * HTTP Responses:
 * - `200 OK`: Reserve successfully confirmed.
 * - `400 Bad Request`: Invalid user or reserve ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: The reserve with the given ID was not found.
 * - `412 Precondition Failed`: The reserve with the given ID is not 
 *   associated with the user.
 */

  async confirmReserve(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateReserveId(reserveId);

    return await this.usersReservesService.confirmReserveForUser(
      userId,
      reserveId,
    );
  }

  @Get('reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a reserve by ID' })
  @ApiResponse({ status: 200, description: 'Reserve found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid reserve ID.' })
  @ApiParam({ name: 'reserveId', example: '456' })
  /**
   * Find a reserve by its ID.
   * Method: GET /users/reserves/:reserveId
   * Description: Retrieves a reserve with the specified reserve ID.
   * Input Parameters:
   * - `reserveId` (string, required): The ID of the reserve.
   * HTTP Responses:
   * - `200 OK`: Reserve found.
   * - `400 Bad Request`: Invalid reserve ID.
   * - `404 Not Found`: The reserve with the given id was not found.
   * - `401 Unauthorized`: Unauthorized access.
   */

  async findReserveById(@Param('reserveId') reserveId: string) {
    if (isEmpty(reserveId)) {
      throw new HttpException('Invalid reserve ID', HttpStatus.BAD_REQUEST);
    }
    this.validateReserveId(reserveId);
    return await this.usersReservesService.findReserveById(reserveId);
  }

  @Get(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a reserve by user ID and reserve ID' })
  @ApiResponse({ status: 200, description: 'Reserve found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
  /**
   * Find a reserve by its user ID and reserve ID.
   * Method: GET /users/:userId/reserves/:reserveId
   * Description: Retrieves a reserve with the specified reserve ID and the
   * specified user ID.
   * Input Parameters:
   * - `userId` (string, required): The ID of the user.
   * - `reserveId` (string, required): The ID of the reserve.
   * HTTP Responses:
   * - `200 OK`: Reserve found.
   * - `400 Bad Request`: Invalid user or reserve ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The reserve with the given id was not found.
   * - `412 Precondition Failed`: The reserve with the given id is not associated to the user.
   */
  async findReserveByUserIdReserveId(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateReserveId(reserveId);
    return await this.usersReservesService.findReserveFromUser(
      userId,
      reserveId,
    );
  }

  @Get(':userId/reserves')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all reserves by user ID' })
  @ApiResponse({ status: 200, description: 'Reserves found.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'The user with the given id was not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiParam({ name: 'userId', example: '123' })
  /**
   * Find all reserves associated with the specified user ID.
   * Method: GET /users/:userId/reserves
   * Description: Find all reserves associated with the user with the given ID.
   * Input Parameters:
   * - `userId` (string, required): The ID of the user.
   * HTTP Responses:
   * - `200 OK`: Reserves found.
   * - `204 No Content`: No reserves found.
   * - `400 Bad Request`: Invalid user ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: The user with the given id was not found.
   */
  async findReservesByUserId(@Param('userId') userId: string) {
    if (isEmpty(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    } else {
      return await this.usersReservesService.findReservesFromUser(userId);
    }
  }

  @Delete(':userId/reserves/:reserveId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reserve from a user' })
  @ApiResponse({
    status: 204,
    description: 'Reserve successfully deleted from user.',
  })
  @ApiResponse({
    status: 404,
    description: 'The user or reserve with the given id was not found.',
  })
  @ApiResponse({
    status: 412,
    description: 'The reserve with the given id is not associated to the user.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user or reserve ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiParam({ name: 'userId', example: '123' })
  @ApiParam({ name: 'reserveId', example: '456' })
/**
 * DOC: Delete Reserve From User
 * Method: DELETE /users/:userId/reserves/:reserveId
 * Description: Deletes a specific reserve associated with a user.
 * Input Parameters:
 * - `userId` (string, required): The ID of the user.
 * - `reserveId` (string, required): The ID of the reserve to be deleted.
 * Example Request (JSON format):
 * {
 *   "userId": "123",
 *   "reserveId": "456"
 * }
 * HTTP Responses:
 * - `204 No Content`: Reserve successfully deleted from user.
 * - `400 Bad Request`: Invalid user or reserve ID.
 * - `401 Unauthorized`: Unauthorized access.
 * - `404 Not Found`: The user or reserve with the given id was not found.
 * - `412 Precondition Failed`: The reserve with the given id is not associated to the user.
 */

  async deleteReserveFromUser(
    @Param('userId') userId: string,
    @Param('reserveId') reserveId: string,
  ) {
    if (isEmpty(userId) || isEmpty(reserveId)) {
      throw new HttpException(
        'Invalid user or reserve ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateReserveId(reserveId);

    return await this.usersReservesService.deleteReserveFromUser(
      userId,
      reserveId,
    );
  }
}
