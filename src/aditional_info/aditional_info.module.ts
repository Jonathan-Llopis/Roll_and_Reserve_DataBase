import { Module } from '@nestjs/common';
import { AditionalInfoController } from './aditional_info.controller';
import { AditionalInfoService } from './aditional_info.service';

@Module({
  controllers: [AditionalInfoController],
  providers: [AditionalInfoService]
})
export class AditionalInfoModule {}
