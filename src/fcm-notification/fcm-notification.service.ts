import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmNotificationService {
  private readonly logger = new Logger(FcmNotificationService.name);
  private isInitialized = false;

  /**
   * Initialize the Firebase Admin SDK with the credentials stored
   * in environment variables if present.
   */
  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = process.env.PROJECT_ID_FIREBASE;
    const clientEmail = process.env.CLIENT_EMAIL_FIREBASE;
    const privateKey = process.env.PRIVATE_KEY_FIREBASE;

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials missing; push notifications will operate in mock/noop mode.',
      );
      this.isInitialized = false;
      return;
    }

    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }
      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      this.isInitialized = false;
    }
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * DOC: Send Multicast Notification
   * Method: POST /send-multicast-notification
   * Description: Sends a notification to multiple devices identified by their FCM tokens.
   */
  async sendMulticastNotification(
    notificationTokens: string[],
    title: string,
    body: string,
    imageUrl?: string,
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.debug(
        `Firebase not initialized. Skipped sending multicast notification "${title}" to ${notificationTokens.length} tokens.`,
      );
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      tokens: notificationTokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Successfully sent notification: ${response.successCount} succeeded, ${response.failureCount} failed`,
      );
    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }

  /**
   * Send Topic Notification
   * Method: POST /send-topic-notification
   * Description: Sends a notification to all devices subscribed to a topic identified by the shop's ID.
   */
  async sendTopicNotification(
    idShop: string,
    title: string,
    body: string,
    imageUrl?: string,
  ): Promise<void> {
    if (!this.isInitialized) {
      this.logger.debug(
        `Firebase not initialized. Skipped sending topic notification "${title}" for shop ${idShop}.`,
      );
      return;
    }

    const topic = `${idShop}`;

    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      topic: topic,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent notification to topic ${topic}: ${response}`);
    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }
}
