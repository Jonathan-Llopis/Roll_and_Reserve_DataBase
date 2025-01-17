import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { FilesService } from '../files/files.service';

@Module({
  providers: [LabelsService, FilesService],
  exports: [LabelsService],
})
export class LabelsModule {}
