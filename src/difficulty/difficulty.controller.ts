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

@Controller('difficulties')
export class DifficultyController {
  constructor(private readonly difficultyService: DifficultyService) {}

  @Get()
  getAllDifficulties() {
    try {
      return this.difficultyService.getAllDifficulties();
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
  getDifficulty(@Param('id') id: string) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.getDifficulty(difficultyId);
  }

  @Post()
  createDifficulty(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultyService.createDifficulty(createDifficultyDto);
  }

  @Put(':id')
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

  @Delete(':id')
  deleteDifficulty(@Param('id') id: string) {
    const difficultyId = parseInt(id);
    if (isNaN(difficultyId)) {
      throw new HttpException('Invalid difficulty ID', HttpStatus.BAD_REQUEST);
    }
    return this.difficultyService.deleteDifficulty(difficultyId);
  }
}
