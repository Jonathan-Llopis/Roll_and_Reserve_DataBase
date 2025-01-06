import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { UsersTablesService } from './users_tables.service';
import { TablesService } from '../tables/tables.service';
import { CreateTableDto } from '../tables/tables.dto';

@Controller('users')
export class UsersTablesController {
  constructor(
    private readonly usersTablesService: UsersTablesService,
    private readonly tablesService: TablesService,
  ) {}

  @Post(':userId/tables/:tableId')
  async addTableToUser(
    @Param('userId') userId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.usersTablesService.addTableToUser(userId, tableId);
  }

  @Put(':userId/tables')
  async associateTableToUser(
    @Body() tablesDto: CreateTableDto[],
    @Param('userId') userId: string,
  ) {
    return this.usersTablesService.updateTablesFromUser(userId, tablesDto);
  }

  @Delete(':userId/tables/:tableId')
  @HttpCode(204)
  async deleteTableFromUser(
    @Param('userId') userId: string,
    @Param('tableId') tableId: string,
  ) {
    if (isEmpty(userId) || isEmpty(tableId)) {
      throw new HttpException(
        'Invalid user or table ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersTablesService.deleteTableFromUser(userId, tableId);
  }

  @Get(':userId/tables/:tableId')
  async findTableByUserIdTableId(
    @Param('userId') userId: string,
    @Param('tableId') tableId: string,
  ) {
    if (isEmpty(userId) || isEmpty(tableId)) {
      throw new HttpException(
        'Invalid user or table ID',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersTablesService.findTableFromUser(userId, tableId);
  }

  @Get(':userId/tables')
  async findTablesByUserId(@Param('userId') userId: string) {
    if (isEmpty(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersTablesService.findTablesFromUser(userId);
  }
}
