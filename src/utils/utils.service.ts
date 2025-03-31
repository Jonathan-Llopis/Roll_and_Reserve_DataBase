import { Injectable } from '@nestjs/common';
import * as convert from 'xml-js';

@Injectable()
export class UtilsService {
  /**
   * Method: POST /convert/json-to-xml
   * Description: Converts given JSON string to XML string
   * Input Parameters:
   * - `json` (string, required): JSON string to convert
   * Example Request (JSON format):
   * {
   *   "key1": "value1",
   *   "key2": 123
   * }
   * HTTP Responses:
   * - `200 OK`: XML string converted from given JSON
   * - `4XX/5XX`: Bad Request or Internal Server Error
   */
  convertJSONtoXML(json: string): string {
    const options = { compact: true, ignoreComment: true, spaces: 4 };
    return convert.json2xml(json, options);
  }
}
