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
import { DifficultyService } from './difficulty.service';
import { CreateDifficultyDto, UpdateDifficultyDto } from './difficulty.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('difficulties')
export class DifficultyController {
  constructor(private readonly difficultyService: DifficultyService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new difficulty' })
  @ApiResponse({ status: 201, description: 'Difficulty successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
/* DOC: Create Difficulty
 * Method: POST /difficulties
 * Description: Creates a new difficulty level in the system.
 * Input Parameters:
 * - `createDifficultyDto` (CreateDifficultyDto, required): Object containing difficulty details.
 *   - `description` (string, required): The description of the difficulty (1 to 500 characters).
 *   - `difficulty_rate` (number, required): The difficulty rate, ranging from 0 to 100.
 * Example Request (JSON format):
 * {
 *   "description": "Hard",
 *   "difficulty_rate": 90
 * }
 * HTTP Responses:
 * - `201 Created`: { "id_difficulty": 1, "description": "Hard", "difficulty_rate": 90 }
 * - `400 Bad Request`: { "error": "Invalid input data" }
 * - `401 Unauthorized`: { "error": "Unauthorized" }
 */
  createDifficulty(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultyService.createDifficulty(createDifficultyDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing difficulty' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the difficulty',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Difficulty successfully updated.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid difficulty ID or input data.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
/* DOC: Update Difficulty
 * Method: PUT /difficulties/:id
 * Description: Updates an existing difficulty level in the system.
 * Input Parameters:
 * - `id` (string, required, path): The ID of the difficulty to be updated.
 * - `updateDifficultyDto` (UpdateDifficultyDto, required, body): Object containing the updated difficulty details.
 *   - `description` (string, optional): The new description of the difficulty (1 to 500 characters).
 *   - `difficulty_rate` (number, optional): The new difficulty rate, ranging from 0 to 100.
 * Example Request (JSON format):
 * {
 *   "description": "Hard",
 *   "difficulty_rate": 90
 * }
 * HTTP Responses:
 * - `200 OK`: { "id_difficulty": 1, "description": "Hard", "difficulty_rate": 90 }
 * - `400 Bad Request`: { "error": "Invalid difficulty ID or input data" }
 * - `401 Unauthorized`: { "error": "Unauthorized" }
 * - `404 Not Found`: { "error": "Difficulty not found" }
 */
  updateDifficulty(
    @Param('id') id: string,
    @Body() updateDifficultyDto: UpdateDifficultyDto,
  ) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.updateDifficulty(
      updateDifficultyDto,
      difficultyId,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all difficulties' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all difficulties.',
  })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })

/* DOC: Get All Difficulties
 * Method: GET /difficulties
 * Description: Retrieves a list of all difficulty levels available in the system.
 * Input Parameters: None
 * Example Request: None
 * HTTP Responses:
 * - `200 OK`: [{ "id_difficulty": 1, "description": "Easy", "difficulty_rate": 10 }, { ... }]
 * - `204 No Content`: No difficulties found.
 * - `401 Unauthorized`: { "error": "Unauthorized" }
 * - `400 Bad Request`: { "error": "Bad request" }
 */

  getAllDifficulties() {
    return this.difficultyService.getAllDifficulties();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get difficulty by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the difficulty',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved difficulty.',
  })
  @ApiResponse({ status: 400, description: 'Invalid difficulty ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
  /* DOC: Get Difficulty by ID
   * Method: GET /difficulties/:id
   * Description: Retrieves a difficulty level by its ID.
   * Input Parameters:
   * - `id` (string, required): The ID of the difficulty.
   * Example Request: None
   * HTTP Responses:
   * - `200 OK`: { "id_difficulty": 1, "description": "Easy", "difficulty_rate": 10 }
   * - `400 Bad Request`: { "error": "Invalid difficulty ID" }
   * - `401 Unauthorized`: { "error": "Unauthorized" }
   * - `404 Not Found`: { "error": "Difficulty not found" }
   */
  getDifficulty(@Param('id') id: string) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.getDifficulty(difficultyId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a difficulty' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the difficulty',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Difficulty successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid difficulty ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
  /* DOC: Delete Difficulty
   * Method: DELETE /difficulties/:id
   * Description: Deletes an existing difficulty level in the system.
   * Input Parameters:
   * - `id` (string, required): The ID of the difficulty to be deleted.
   * Example Request: None
   * HTTP Responses:
   * - `200 OK`: Successfully deleted the difficulty.
   * - `400 Bad Request`: Invalid difficulty ID.
   * - `401 Unauthorized`: Unauthorized.
   * - `404 Not Found`: Difficulty not found.
   */
  deleteDifficulty(@Param('id') id: string) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.deleteDifficulty(difficultyId);
  }
}
