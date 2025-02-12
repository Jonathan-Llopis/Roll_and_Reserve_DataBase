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
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@Controller('difficulties')
export class DifficultyController {
  constructor(private readonly difficultyService: DifficultyService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new difficulty' })
    @ApiResponse({ status: 201, description: 'Difficulty successfully created.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    createDifficulty(@Body() createDifficultyDto: CreateDifficultyDto) {
      return this.difficultyService.createDifficulty(createDifficultyDto);
    }


  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing difficulty' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the difficulty', example: '1' })
  @ApiResponse({ status: 200, description: 'Difficulty successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid difficulty ID or input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
  updateDifficulty(
    @Param('id') id: string,
    @Body() updateDifficultyDto: UpdateDifficultyDto,
  ) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.updateDifficulty(updateDifficultyDto, difficultyId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all difficulties' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all difficulties.' })
  @ApiResponse({ status: 204, description: 'No content.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  getAllDifficulties() {
    return this.difficultyService.getAllDifficulties();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get difficulty by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the difficulty', example: '1' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved difficulty.' })
  @ApiResponse({ status: 400, description: 'Invalid difficulty ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
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
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the difficulty', example: '1' })
  @ApiResponse({ status: 200, description: 'Difficulty successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid difficulty ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Difficulty not found.' })
  deleteDifficulty(@Param('id') id: string) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.deleteDifficulty(difficultyId);
  }
}
