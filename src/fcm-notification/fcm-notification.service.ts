import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmNotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID_FIREBASE,
        clientEmail: process.env.CLIENT_EMAIL_FIREBASE,
        privateKey: process.env.PRIVATE_KEY_FIREBASE.replace(/\\n/g, '\n'),
      }),
    });
  }

  async sendMulticastNotification(
    notificationTokens: string[],
    title: string,
    body: string,
  ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: title,
        body: body,
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
  async sendTopicNotification(
    idShop: string,
    createReserveDto: { description: string },
  ): Promise<void> {
    const topic = `${idShop}`;

    const message: admin.messaging.Message = {
      notification: {
        title: 'Nuevo evento creado',
        body: `Un nuevo evento ha sido creado: ${createReserveDto.description}`,
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
