import { Injectable, Logger, Res } from '@nestjs/common';
import * as streamModule from 'stream';
import { BLANK_PDF } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { text, image, barcodes } from '@pdfme/schemas';
import { FilesService } from '../../files/files.service';
import { GridFSBucketReadStream } from 'typeorm';
import * as fileType from 'file-type';

class PositionObj {
  /**
   * Construct a Position object.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class SchemaObj {
  /**
   * Construct a Schema object.
   * @param name The name of the label.
   * @param type The type of the label.
   * @param position The position of the label.
   * @param width The width of the label.
   * @param height The height of the label.
   * @param fontSize The font size of the label.
   * @throws {Error} If the type, position, width, height or fontSize is invalid.
   */
  constructor(
    public name: string,
    public type: string,
    public position: PositionObj,
    public width: number,
    public height: number,
    public fontSize: number,
  ) {
    if (!type || !position || width === undefined || height === undefined) {
      throw new Error(
        `SchemaObj inválido: ${JSON.stringify({ type, position, width, height, fontSize })}`,
      );
    }
  }
}
const labelModel = {
  '1272': {
    colHorizontalIncrement: 70,
    colVerticalIncrement: 35,
    itemsPerPage: 24,
    cols: 3,
    rows: 8,
    qrcode: new PositionObj(5, 13),
    text_etiqueta: new PositionObj(26, 12),
    aula: new PositionObj(26, 22),
    ns: new PositionObj(26, 28),
    logo: new PositionObj(50, 10),
  },
  '11783': {
    colHorizontalIncrement: 104,
    colVerticalIncrement: 37,
    itemsPerPage: 16,
    cols: 2,
    rows: 8,
    qrcode: new PositionObj(12, 8),
    text_etiqueta: new PositionObj(36, 8),
    aula: new PositionObj(36, 16),
    ns: new PositionObj(36, 23),
    logo: new PositionObj(82, 6),
  },
};

const labelModelName = '11783';
@Injectable()
export class LabelsService {
  constructor(private readonly fileService: FilesService) {}
/**
 * DOC: Generate PDF Labels
 * Method: POST /labels/generate
 * Description: Generates and returns a PDF containing labels for specified table items. Each label includes a QR code, table number, shop name, and shop logo.
 * Input Parameters:
 * - `tables_items` (array of objects, required): Array of table items to generate labels for. Each item should contain `id_table`, `number_table`, and `tables_of_shop` with `name` and `logo`.
 * - `res` (response object, required): Express response object for streaming the generated PDF.
 * Example Request (JSON format):
 * {
 *   "table_items": [
 *     {
 *       "id_table": 1,
 *       "number_table": 5,
 *       "tables_of_shop": {
 *         "name": "Shop Name",
 *         "logo": "logo_id"
 *       }
 *     }
 *   ]
 * }
 * HTTP Responses:
 * - `200 OK`: PDF generated successfully and streamed as response.
 * - `400 Bad Request`: Invalid input data.
 * - `500 Internal Server Error`: Error during PDF generation.
 */

  async generateLabels(tables_items, @Res() res: any) {
    const colHorizontalIncrement =
      labelModel[labelModelName].colHorizontalIncrement;
    const colVerticalIncrement =
      labelModel[labelModelName].colVerticalIncrement;
    const itemLength = tables_items.length;
    const itemsPerPage = labelModel[labelModelName].itemsPerPage;
    let itemCount = 0;
    const pagesLength = Math.ceil(itemLength / itemsPerPage);
    const inputs = [];
    const schemasObj = {};
    for (let page = 0; page < pagesLength; page++) {
      const inputsObj = {};
      let row = 0;
      let col = 0;
      while (itemCount < itemLength && row < labelModel[labelModelName].rows) {
        col = 0;
        while (
          itemCount < itemLength &&
          col < labelModel[labelModelName].cols
        ) {
          let newObjKey = '';
          newObjKey = 'qrcode' + row + '-' + col;
          let position = {
            x:
              labelModel[labelModelName].qrcode.x +
              col * colHorizontalIncrement,
            y: labelModel[labelModelName].qrcode.y + row * colVerticalIncrement,
          };
          schemasObj[newObjKey] = new SchemaObj(
            'qrCode',
            'qrcode',
            position,
            20,
            20,
            0,
          );
          inputsObj[newObjKey] =
            'rollandreserve://app/user/userReserves/' +
            tables_items[itemCount].id_table;
          newObjKey = 'etiqueta' + row + '-' + col;
          position = {
            x:
              labelModel[labelModelName].text_etiqueta.x +
              col * colHorizontalIncrement,
            y:
              labelModel[labelModelName].text_etiqueta.y +
              row * colVerticalIncrement,
          };
          const fontSizeEtiquet = 20;

          schemasObj[newObjKey] = new SchemaObj(
            'table',
            'text',
            position,
            60,
            7,
            fontSizeEtiquet,
          );
          inputsObj[newObjKey] =
            'Mesa: ' + tables_items[itemCount].number_table;

          newObjKey = 'shop' + row + '-' + col;
          position = {
            x: labelModel[labelModelName].aula.x + col * colHorizontalIncrement,
            y: labelModel[labelModelName].aula.y + row * colVerticalIncrement,
          };
          schemasObj[newObjKey] = new SchemaObj(
            'shop',
            'text',
            position,
            60,
            7,
            12,
          );
          inputsObj[newObjKey] =
            'Tienda : ' + tables_items[itemCount].tables_of_shop.name;
          // Logo image
          newObjKey = 'logo' + row + '-' + col;
          position = {
            x: labelModel[labelModelName].logo.x + col * colHorizontalIncrement,
            y: labelModel[labelModelName].logo.y + row * colVerticalIncrement,
          };

          schemasObj[newObjKey] = new SchemaObj(
            'logo',
            'image',
            position,
            15,
            15,
            0,
          );
          if (tables_items[itemCount].tables_of_shop.logo == '') {
            tables_items[itemCount].tables_of_shop.logo =
              '67892cbb711e83b210011487';
          }
          console.log(tables_items[itemCount].tables_of_shop.logo);
          const logoStream = await this.fileService.readStream(
            tables_items[itemCount].tables_of_shop.logo,
          );
          const logoBuffer = await this.streamToBuffer(logoStream);
          const fileTypeResult = await fileType.fromBuffer(logoBuffer);
          console.log(fileTypeResult);
          if (
            !fileTypeResult ||
            !['image/png', 'image/jpeg', 'image/jpg'].includes(
              fileTypeResult.mime,
            )
          ) {
            throw new Error('The input is not a PNG, JPEG, JPG, or WEBP file!');
          }

          const logoImgDataBase64 =
            `data:${fileTypeResult.mime};base64,` +
            logoBuffer.toString('base64');
          inputsObj[newObjKey] = logoImgDataBase64;
          col++;
          itemCount++;
        }
        row++;
      }
      inputs.push(inputsObj);
    }

    const templateSchemas = [];
    const rows = [];
    for (const key in schemasObj) {
      if (schemasObj.hasOwnProperty(key)) {
        const schema = schemasObj[key];
        let row = rows.find((row) =>
          row.find((schema) => schema.position.y === schema.position.y),
        );
        if (!row) {
          row = [];
          rows.push(row);
        }
        row.push({
          name: key,
          type: schema.type,
          position: schema.position,
          width: schema.width,
          height: schema.height,
          fontSize: schema.fontSize,
        });
      }
    }
    templateSchemas.push(...rows);
    const template = {
      basePdf: BLANK_PDF,
      schemas: templateSchemas,
    };
    const plugins = { text, image, qrcode: barcodes.qrcode };

    generate({ template, inputs, plugins })
      .then((pdf) => {
        if (pdf == null) {
        } else {
          const readStream = new streamModule.PassThrough();
          readStream.end(pdf);
          res.set('Content-disposition', 'attachment; filename=etiquetes.pdf');
          res.set('Content-Type', 'application/pdf');
          readStream.pipe(res);
          return pdf;
        }
      })
      .catch((error) => {
        Logger.error('Error al generar el PDF:', error);
      });
  }
  /**
   * Takes a GridFSBucketReadStream and returns a Promise that resolves to a Buffer.
   * It is used to convert a MongoDB GridFSBucketReadStream to a Buffer, which is
   * necessary to generate a PDF with the pdfme library.
   * @param {GridFSBucketReadStream} stream - The GridFSBucketReadStream to convert.
   * @returns {Promise<Buffer>} - A Promise that resolves to a Buffer.
   */
  private streamToBuffer(stream: GridFSBucketReadStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }
}
