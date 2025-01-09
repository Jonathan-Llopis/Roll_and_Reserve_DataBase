import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservesEntity } from './reserves.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservesEntity])],
  controllers: [ReservesController],
  providers: [ReservesService],
})
export class ReservesModule {}
