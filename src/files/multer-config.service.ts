import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { config } from 'dotenv';
config();
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';
const url = process.env.MONGODB_URI;

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
  private gridFsStorage: GridFsStorage;
  /**
   * Create a new GridFS storage instance.
   * @constructor
   */
  constructor() {
    this.gridFsStorage = new GridFsStorage({
      url: url,
    /**
     * File naming function for GridFS storage.
     * @param {any} _req - The request object.
     * @param {any} file - The file object.
     * @returns {Promise<any>}
     * @description
     * This function takes a request and a file object, trims the original name
     * of the file, and resolves a promise with an object containing the
     * trimmed filename.
     */
      file: (_req, file) => {
        return new Promise((resolve, _reject) => {
          const filename = file.originalname.trim();
          const fileInfo = {
            filename: filename,
          };
          resolve(fileInfo);
        });
      },
    });
  }

  /**
   * Returns a MulterModuleOptions object with the configured GridFS storage.
   * @returns {MulterModuleOptions}
   * @description
   * This method returns an object containing the GridFS storage configuration.
   * The object is assigned to the `MulterModule` options.
   */
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: this.gridFsStorage,
    };
  }
}
