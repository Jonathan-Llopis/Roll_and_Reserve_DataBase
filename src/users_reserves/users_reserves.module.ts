import { Module } from '@nestjs/common';
import { UsersReservesController } from './users_reserves.controller';
import { UsersReservesService } from './users_reserves.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';
import { TablesModule } from '../tables/tables.module';
import { ReservesEntity } from 'src/reserves/reserves.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ReservesEntity]),
    TablesModule,
  ],
  controllers: [UsersReservesController],
  providers: [UsersReservesService],
  exports: [UsersReservesService],
})
export class UsersTablesModule {}
