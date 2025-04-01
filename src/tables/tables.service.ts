import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { TablesEntity } from './tables.entity';
import { LabelsService } from '../utils/labels/labels.service';
import { ShopsEntity } from '../shops/shops.entity';

@Injectable()
export class TablesService {
  /**
   * Constructor of the TablesService.
   * @param tableRepository The repository for the TablesEntity.
   * @param shopRepository The repository for the ShopsEntity.
   * @param labelsService The service for generating labels.
   */

  constructor(
    @InjectRepository(TablesEntity)
    private readonly tableRepository: Repository<TablesEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    private readonly labelsService: LabelsService,
  ) {}

  /**
   * Throws an HttpException for the given error, or a default BAD_REQUEST
   * error if the given error is not an HttpException.
   *
   * @param err - The error to throw.
   */
  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
  }

  /**
   * Retrieve all tables.
   * Method: GET /tables
   * Description: Retrieve all tables, including their reserves and shop.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved tables. Example response:
   *   [
   *     {
   *       id_table: 1,
   *       number_table: 5,
   *       reserves_of_table: [],
   *       tables_of_shop: {
   *         id_shop: 1,
   *         name: 'Shop Name',
   *         address: 'Shop Address',
   *         logo: 'Shop Logo',
   *         latitud: 0,
   *         longitud: 0,
   *         phone: '123456789',
   *         email: 'shop@example.com',
   *         opening_hours: '9:00-18:00',
   *         owner: {
   *           id_google: '1234567890',
   *         },
   *         reviews_shop: [],
   *         games: [],
   *         tables_in_shop: []
   *       }
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No tables found.
   * - `400 Bad Request`: General request error.
   */
  async getAllTables(): Promise<TablesEntity[]> {
    try {
      const tables = await this.tableRepository.find({
        relations: ['reserves_of_table', 'tables_of_shop'],
      });
      if (!tables.length) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return tables;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve a table by its ID.
   * Method: GET /tables/:id
   * Description: Fetch a table entity, including its associated reserves and shop, based on the table ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the table to retrieve.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the table. Example response:
   *   {
   *     id_table: 1,
   *     number_table: 5,
   *     reserves_of_table: [],
   *     tables_of_shop: {
   *       id_shop: 1,
   *       name: 'Shop Name',
   *       ...
   *     }
   *   }
   * - `404 Not Found`: Table not found.
   * - `400 Bad Request`: General request error.
   */

  async getTable(id: number): Promise<TablesEntity> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id_table: id },
        relations: ['reserves_of_table', 'tables_of_shop'],
      });
      if (!table) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }
      return table;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve all tables in a shop.
   * Method: GET /tables/shop/:idShop
   * Description: Fetch all tables in a shop, including their reserves and shop, based on the shop ID.
   * Input Parameters:
   * - `idShop` (number, required): The ID of the shop to retrieve tables from.
   * HTTP Responses:
   * - `200 OK`: Successfully retrieved the tables. Example response:
   *   [
   *     {
   *       id_table: 1,
   *       number_table: 5,
   *       reserves_of_table: [],
   *       tables_of_shop: {
   *         id_shop: 1,
   *         name: 'Shop Name',
   *         ...
   *       }
   *     },
   *     ...
   *   ]
   * - `204 No Content`: No tables found in the shop.
   * - `400 Bad Request`: General request error.
   */
  async getAllTablesByShop(idShop: number): Promise<TablesEntity[]> {
    try {
      const tables = await this.tableRepository.find({
        relations: ['reserves_of_table', 'tables_of_shop'],
        where: { tables_of_shop: { id_shop: idShop } },
      });
      if (!tables.length) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }
      return tables;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Create a new table in a shop.
   * Method: POST /tables
   * Description: Create a new table in a shop, with the given number and shop ID.
   * Input Parameters:
   * - `number_table` (number, required): The number of the table to create.
   * - `shop_id` (number, required): The ID of the shop to create the table in.
   * HTTP Responses:
   * - `201 Created`: Successfully created the table. Example response:
   *   {
   *     id_table: 1,
   *     number_table: 5,
   *     tables_of_shop: {
   *       id_shop: 1,
   *       name: 'Shop Name',
   *       ...
   *     }
   *   }
   * - `400 Bad Request`: General request error.
   * - `404 Not Found`: Shop not found.
   */
  async createTable(createTableDto: CreateTableDto): Promise<TablesEntity> {
    try {
      const table = this.tableRepository.create(createTableDto);
      const shop = await this.shopRepository.findOne({
        where: { id_shop: createTableDto.shop_id },
      });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      table.tables_of_shop = shop;
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update a table by its ID.
   * Method: PUT /tables/:id
   * Description: Update a table by its ID, with the given update data.
   * Input Parameters:
   * - `id` (number, required): The ID of the table to update.
   * - `updateTableDto` (object, required):
   *   - `number_table` (number, optional): The new number of the table.
   *   - `shop_id` (number, optional): The new shop ID of the table.
   * HTTP Responses:
   * - `200 OK`: Successfully updated the table. Example response:
   *   {
   *     id_table: 1,
   *     number_table: 10,
   *     tables_of_shop: {
   *       id_shop: 1,
   *       name: 'Shop Name',
   *       ...
   *     }
   *   }
   * - `400 Bad Request`: General request error.
   * - `404 Not Found`: Table not found.
   */
  async updateTable(
    updateTableDto: UpdateTableDto,
    id: number,
  ): Promise<TablesEntity> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id_table: id },
        relations: ['tables_of_shop'],
      });
      if (!table) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }

      if (updateTableDto.shop_id) {
        const shop = await this.shopRepository.findOne({
          where: { id_shop: updateTableDto.shop_id },
        });
        if (!shop) {
          throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
        }
        table.tables_of_shop = shop;
      }

      this.tableRepository.merge(table, updateTableDto);
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Delete a table by its ID.
   * Method: DELETE /tables/:id
   * Description: Delete a table by its ID.
   * Input Parameters:
   * - `id` (number, required): The ID of the table to delete.
   * HTTP Responses:
   * - `200 OK`: Table deleted successfully.
   * - `400 Bad Request`: Invalid table ID.
   * - `401 Unauthorized`: Unauthorized access.
   * - `404 Not Found`: Table not found.
   */
  async deleteTable(id: number): Promise<void> {
    try {
      const result = await this.tableRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Unexpected error:', err);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Generate QR codes for table items
   * Method: POST /tables/qr
   * Description: Generate QR codes for table items
   * Input Parameters:
   * - `table_items` (array of numbers, required): Array of table item IDs
   * Example Request (JSON format):
   * {
   *   "table_items": [1, 2, 3]
   * }
   * HTTP Responses:
   * - `201 Created`: QR code generated successfully.
   * - `400 Bad Request`: Invalid table_items
   * - `401 Unauthorized`: Unauthorized
   * - `404 Not Found`: Tables not found
   */
  async generate_qr(table_items: any, res: any) {
    try {
      const tablesItems = await this.tableRepository.find({
        relations: ['reserves_of_table', 'tables_of_shop'],
        where: table_items,
      });

      if (!tablesItems.length) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      const filterInventoryItems = tablesItems.filter((item) =>
        table_items.includes(item.id_table),
      );

      if (!filterInventoryItems.length) {
        throw new HttpException('No Content', HttpStatus.NO_CONTENT);
      }

      this.labelsService.generateLabels(filterInventoryItems, res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Invalid table_items', HttpStatus.BAD_REQUEST);
    }
  }
}
