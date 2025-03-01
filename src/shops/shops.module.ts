import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsEntity } from './shops.entity';
import { UserEntity } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopsEntity, UserEntity])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
