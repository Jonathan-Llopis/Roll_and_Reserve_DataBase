import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsMulterConfigService } from './multer-config.service';
import { FilesService } from '././files.service';
import { UsersService } from '../users/users.service';
import { UtilsModule } from '../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/users.entity';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService,
    }),
    UtilsModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [FilesController],
  providers: [GridFsMulterConfigService, FilesService, UsersService],
})
export class FilesModule {}
