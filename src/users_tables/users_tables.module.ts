import { Module } from '@nestjs/common';
import { UsersTablesController } from './users_tables.controller';
import { UsersTablesService } from './users_tables.service';

@Module({
  controllers: [UsersTablesController],
  providers: [UsersTablesService],
})
export class UsersTablesModule {}
