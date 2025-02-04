import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMINSDK_JSON);


@Injectable()
export class FcmNotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
          projectId: process.env.PROJECT_ID_FIREBASE,
          clientEmail: process.env.PRIVATE_KEY_FIREBASE,
          privateKey:process.env.CLIENT_EMAIL_FIREBASE,
      }),
  });
  }

  async sendMulticastMessage(registrationTokens: string[],title:string,body:string ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      data: {
      title: title,
      body: body,
      },
      tokens: registrationTokens,
    };

    await admin
      .messaging()
      .sendEachForMulticast(message)
      .then((response) => {
      console.log('Successfully sent message:', response);
      })
      .catch((error) => {
      console.log('Error sending message:', error);
      });
    }
    async sendTopicMessage(idShop: string, createReserveDto: { description: string }): Promise<void> {
      const topic = `${idShop}`;

      const message: admin.messaging.Message = {
        data: {
          title: 'Nuevo evento creado',
          description: `Un nuevo evento ha sido creado: ${createReserveDto.description}`,
        },
        topic: topic,
      };

      await admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
    }
}
