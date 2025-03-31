import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmNotificationService {


  /**
   * Initialize the Firebase Admin SDK with the credentials stored
   * in environment variables.
   */
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID_FIREBASE,
        clientEmail: process.env.CLIENT_EMAIL_FIREBASE,
        privateKey: process.env.PRIVATE_KEY_FIREBASE.replace(/\\n/g, '\n'),
      }),
    });
  }





/**
 * DOC: Send Multicast Notification
 * Method: POST /send-multicast-notification
 * Description: Sends a notification to multiple devices identified by their FCM tokens.
 * Input Parameters:
 * - `notificationTokens` (string[], required): An array of FCM tokens to which the notification will be sent.
 * - `title` (string, required): The title of the notification.
 * - `body` (string, required): The body content of the notification.
 * - `imageUrl` (string, optional): URL of the image to be included in the notification.
 * Example Request (JSON format):
 * {
 *   "notificationTokens": ["token1", "token2"],
 *   "title": "New Offer!",
 *   "body": "Check out our new deals.",
 *   "imageUrl": "http://example.com/image.png"
 * }
 * HTTP Responses:
 * - `200 OK`: Notification sent successfully. { "successCount": 2, "failureCount": 0 }
 * - `4XX/5XX`: Error sending notification due to invalid tokens or server issues.
 */

  async sendMulticastNotification(
    notificationTokens: string[],
    title: string,
    body: string,
    imageUrl?: string,
  ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      tokens: notificationTokens,
    };

    console.log('Sending notification to', message);

    await admin
      .messaging()
      .sendEachForMulticast(message)
      .then((response) => {
        console.log('Successfully sent notification:', response);
      })
      .catch((error) => {
        console.log('Error sending notification:', error);
      });
  }



  /**
   * Send Topic Notification
   * Method: POST /send-topic-notification
   * Description: Sends a notification to all devices subscribed to a topic identified by the shop's ID.
   * Input Parameters:
   * - `idShop` (string, required): The ID of the shop.
   * - `title` (string, required): The title of the notification.
   * - `body` (string, required): The body content of the notification.
   * - `imageUrl` (string, optional): URL of the image to be included in the notification.
   * Example Request (JSON format):
   * {
   *   "idShop": "12345",
   *   "title": "New Offer!",
   *   "body": "Check out our new deals.",
   *   "imageUrl": "http://example.com/image.png"
   * }
   * HTTP Responses:
   * - `200 OK`: Notification sent successfully. { "successCount": 1, "failureCount": 0 }
   * - `4XX/5XX`: Error sending notification due to invalid tokens or server issues.
   */
  async sendTopicNotification(
    idShop: string,
    title: string,
    body: string,
    imageUrl?: string,
  ): Promise<void> {
    const topic = `${idShop}`;

    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      topic: topic,
    };

    await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log('Successfully sent notification:', response);
      })
      .catch((error) => {
        console.log('Error sending notification:', error);
      });
  }
}
