import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { TablesEntity } from './tables.entity';
import { LabelsService } from '../utils/labels/labels.service';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TablesEntity)
    private readonly tableRepository: Repository<TablesEntity>,
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
      this.handleError(err);
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
      this.handleError(err);
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
      this.handleError(err);
    }
  }

  async createTable(createTableDto: CreateTableDto): Promise<TablesEntity> {
    try {
      const table = this.tableRepository.create(createTableDto);
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateTable(
    updateTableDto: UpdateTableDto,
    id: number,
  ): Promise<TablesEntity> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id_table: id },
      });
      if (!table) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }
      Object.assign(table, updateTableDto);
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteTable(id: number): Promise<void> {
    try {
      const result = await this.tableRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Table not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      this.handleError(err);
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
