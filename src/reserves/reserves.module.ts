import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesController } from './reserves.controller';

@Module({
  controllers: [ReservesController],
})
export class ReservesModule {}
