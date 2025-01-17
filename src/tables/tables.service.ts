import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto, UpdateTableDto } from './tables.dto';
import { TablesEntity } from './tables.entity';
import { LabelsService } from 'src/utils/labels.service';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TablesEntity)
    private readonly tableRepository: Repository<TablesEntity>,
    private readonly labelsService: LabelsService,
  ) {}

  async getAllTables(): Promise<TablesEntity[]> {
    try {
      const tables = await this.tableRepository.find({
        relations: ['reserves_of_table', 'tables_of_shop'],
      });
      return tables;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getTable(id: number): Promise<TablesEntity> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id_table: id },
        relations: ['reserves_of_table', 'tables_of_shop'],
      });
      if (!table) {
        throw new Error('Table not found');
      }
      return table;
    } catch (err) {
      throw new Error(err);
    }
  }

  async createTable(createTableDto: CreateTableDto): Promise<TablesEntity> {
    try {
      const table = this.tableRepository.create(createTableDto);
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      throw new Error(err);
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
        throw new Error('Table not found');
      }
      Object.assign(table, updateTableDto);
      await this.tableRepository.save(table);
      return table;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteTable(id: number): Promise<void> {
    try {
      await this.tableRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }

  async generate_qr(table_items: any, res: any) {
    try {
      const inventoryItems = await this.tableRepository.find({
        relations: ['reserves_of_table', 'tables_of_shop'],
        where: table_items,
      });

      const filterInventoryItems = inventoryItems.filter((item) =>
        table_items.includes(item.id_table),
      );
      this.labelsService.generateLabels(filterInventoryItems, res);
    } catch (error) {
      throw new HttpException(
        'Inventario no encontrado' + error,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
