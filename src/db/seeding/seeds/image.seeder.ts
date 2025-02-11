import path from "path";
import fs from "fs";
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

if (!process.env.MONGO_CLUSTER_URL) {
    throw new Error("Environment variables MONGO_CLUSTER_URL and MONGO_DATABASE must be set");
}
const url = process.env.MONGO_CLUSTER_URL!;
const dbName = 'mongodb';

const client = new MongoClient(url);

export async function uploadImages() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        const images = [
            {
            id: new ObjectId("678f8551e32f3fa9fd0ed5d4"),
            path: path.join(__dirname, '../../../../uploads/image1.jpg'),
            description: 'First image description',
            },
            {
            id: new ObjectId("678f8573e32f3fa9fd0ed5d6"),
            path: path.join(__dirname, '../../../../uploads/image2.jpg'),
            description: 'Second image description',
            },
        ];

        for (const image of images) {
            const filePath = path.resolve(image.path);
            const uploadStream = bucket.openUploadStreamWithId(image.id, image.path);
            fs.createReadStream(filePath).pipe(uploadStream as unknown as NodeJS.WritableStream)
                .on('error', (error) => {
                    console.error('Error uploading file:', error);
                })
                .on('finish', () => {
                    console.log('File uploaded successfully:', image.path);
                });
        }
    } finally {
        await client.close();
    }
}
