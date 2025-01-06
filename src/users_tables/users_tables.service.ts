import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { TablesEntity } from '../tables/tables.entity';
import { UserEntity } from '../users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersTablesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(TablesEntity)
    private readonly tablesRepository: Repository<TablesEntity>,
  ) {}

  async addTableToUser(userId: string, tableId: string): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_tables'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    const table: TablesEntity = await this.tablesRepository.findOne({
      where: { id_table: parseInt(tableId) },
      relations: ['users_in_table'],
    });
    if (!table)
      throw new BusinessLogicException(
        'The table with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    user.users_tables.push(table);
    return this.usersRepository.save(user);
  }

  async findTableFromUser(
    userId: string,
    tableId: string,
  ): Promise<TablesEntity> {
    const table: TablesEntity = await this.tablesRepository.findOne({
      where: { id_table: parseInt(tableId) },
      relations: ['users_in_table'],
    });
    if (!table)
      throw new BusinessLogicException(
        'The table with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_tables'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const userTable: TablesEntity = user.users_tables.find(
      (table) => table.id_table === parseInt(tableId),
    );

    if (!userTable)
      throw new BusinessLogicException(
        'The table with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );

    return userTable;
  }

  async findTablesFromUser(userId: string): Promise<TablesEntity[]> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_tables'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return user.users_tables;
  }

  async updateTablesFromUser(
    userId: string,
    tables: TablesEntity[],
  ): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_tables'],
    });

    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < tables.length; i++) {
      const table: TablesEntity = await this.tablesRepository.findOne({
        where: { id_table: tables[i].id_table },
        relations: ['users_in_table'],
      });
      if (!table)
        throw new BusinessLogicException(
          'The table with the given id was not found',
          BusinessError.NOT_FOUND,
        );
    }
    user.users_tables = tables;
    return await this.usersRepository.save(user);
  }

  async deleteTableFromUser(userId: string, tableId: string) {
    const table: TablesEntity = await this.tablesRepository.findOne({
      where: { id_table: parseInt(tableId) },
      relations: ['users_in_table'],
    });
    if (!table)
      throw new BusinessLogicException(
        'The table with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const user: UserEntity = await this.usersRepository.findOne({
      where: { id_google: userId },
      relations: ['users_tables'],
    });
    if (!user)
      throw new BusinessLogicException(
        'The user with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const userTable: TablesEntity = user.users_tables.find(
      (table) => table.id_table === parseInt(tableId),
    );

    if (!userTable) {
      user.users_tables = user.users_tables.filter(
        (table) => table.id_table !== parseInt(tableId),
      );
      throw new BusinessLogicException(
        'The table with the given id is not associated to the user',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  }
}
