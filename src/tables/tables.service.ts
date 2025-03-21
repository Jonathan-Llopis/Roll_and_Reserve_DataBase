import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { TablesEntity } from './tables.entity';
import { LabelsService } from '../utils/labels/labels.service';
import { ShopsEntity } from '../shops/shops.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TablesEntity)
    private readonly tableRepository: Repository<TablesEntity>,
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    private readonly labelsService: LabelsService,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
