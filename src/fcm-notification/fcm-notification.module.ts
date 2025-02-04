import { Module } from '@nestjs/common';
import { FcmNotificationService } from './fcm-notification.service';

@Module({
  providers: [FcmNotificationService],
  exports: [FcmNotificationService],
})
export class FcmNotificationModule {}
