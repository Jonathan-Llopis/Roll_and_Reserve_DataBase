import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesEntity } from './tables.entity';
import { LabelsModule } from '../utils/labels/labels.module';
import { UserReserveEntity } from '../users_reserves/users_reserves.entity';
import { ShopsEntity } from '../shops/shops.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TablesEntity, ShopsEntity]),
    LabelsModule,
    UserReserveEntity,
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
