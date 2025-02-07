import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsEntity } from './shops.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopsEntity])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
