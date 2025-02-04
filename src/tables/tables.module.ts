import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesEntity } from './tables.entity';
import { LabelsModule } from '../utils/labels/labels.module';
import { UserReserveEntity } from 'src/users_reserves/user_reserves.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TablesEntity]),
    LabelsModule,
    UserReserveEntity,
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
