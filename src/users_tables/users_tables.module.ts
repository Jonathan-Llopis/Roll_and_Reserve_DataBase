import { Module } from '@nestjs/common';
import { UsersTablesController } from './users_tables.controller';
import { UsersTablesService } from './users_tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesEntity } from '../tables/tables.entity';
import { UserEntity } from '../users/users.entity';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TablesEntity]), TablesModule],
  controllers: [UsersTablesController],
  providers: [UsersTablesService],
  exports: [UsersTablesService],
})
export class UsersTablesModule {}
