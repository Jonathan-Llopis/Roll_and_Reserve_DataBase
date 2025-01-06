import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesEntity } from './tables.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TablesEntity])],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
