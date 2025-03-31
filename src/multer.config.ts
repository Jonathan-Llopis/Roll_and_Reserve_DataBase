import { diskStorage } from 'multer';
import * as path from 'path';
/**
 * Generates a unique filename for uploaded files.
 * 
 * @param {Express.Request} req - The request object.
 * @param {Express.Multer.File} file - The file object containing file details.
 * @param {Function} callback - The callback to be executed with the generated filename.
 * @description
 * This function creates a unique filename using the current timestamp, a random number, 
 * and the original file extension. The generated filename is then passed to the callback.
 */

export const multerConfig = {
  storage: diskStorage({
    destination: './../../../upload/img/',
    filename: (req, file, callback) => {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
