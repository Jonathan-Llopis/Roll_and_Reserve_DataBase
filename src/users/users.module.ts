import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UtilsModule } from '../utils/utils.module';
import { UserEntity } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../Autentication/auth.service';
import { MailModule } from '../mail/mail.module';
import { TablesEntity } from '../tables/tables.entity';

@Module({
  imports: [
    UtilsModule,
    TypeOrmModule.forFeature([UserEntity, TablesEntity]),
    MailModule,
  ],
  exports: [TypeOrmModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {}
