import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UtilsService } from '../utils/utils.service';

import { UserEntity } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getAllUser(xml?: string): Promise<UserEntity[] | string> {
    const users = await this.usersRepository.find();
    if (xml === 'true') {
      const jsonformatted = JSON.stringify({
        users,
      });
      return this.utilsService.convertJSONtoXML(jsonformatted);
    } else {
      return users;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const usuario = await this.usersRepository.create(createUserDto);
    const passwordHash = await bcrypt.hash(await usuario.password, 10);
    usuario.password = passwordHash;
    return this.usersRepository.save(usuario);
  }

  async getStatisticsUser(id_user: number): Promise<any> {
    const UserEntity = await this.usersRepository.findOneBy({ id_user });
    if (UserEntity != null) {
      const statistics = await this.usersRepository
        .createQueryBuilder('UserEntity')
        .select('COUNT(issue.id_issue)', 'totalIssues')
        .addSelect(
          "COUNT(CASE WHEN status.description = 'Creada' THEN 1 END)",
          'numIssuesCreadas',
        )
        .addSelect(
          "COUNT(CASE WHEN status.description = 'En revisión' THEN 1 END)",
          'numIssuesRevision',
        )
        .addSelect(
          "COUNT(CASE WHEN status.description = 'Rechazada' THEN 1 END)",
          'numIssuesRechazadas',
        )
        .addSelect(
          "COUNT(CASE WHEN status.description = 'Completada' THEN 1 END)",
          'numIssuesCompl',
        )
        .addSelect(
          "SEC_TO_TIME(AVG(CASE WHEN status.description = 'Completada' THEN TIMESTAMPDIFF(SECOND, issue.created_at, issue.last_updated) END))",
          'difHorasCompletarIssues',
        )
        .innerJoin('issue', 'issue', 'UserEntity.id_user = issue.id_user')
        .innerJoin('status', 'status', 'status.id_status = issue.id_status')
        .where('UserEntity.id_user = :id', { id: id_user })
        .getRawOne();
      const statisticsAbiertas = await this.usersRepository
        .createQueryBuilder('UserEntity')
        .select('issue.id_issue', 'idIssuesAbierta')
        .innerJoin('issue', 'issue', 'UserEntity.id_user = issue.id_user')
        .innerJoin('status', 'status', 'status.id_status = issue.id_status')
        .where(
          "UserEntity.id_user = :id AND (status.description = 'Creada' OR status.description = 'En revisión')",
          { id: id_user },
        )
        .getRawMany();
      const result = {
        totalIssues: parseInt(statistics.totalIssues),
        numIssuesCreadas: parseInt(statistics.numIssuesCreadas),
        numIssuesRevision: parseInt(statistics.numIssuesRevision),
        numIssuesRechazadas: parseInt(statistics.numIssuesRechazadas),
        numIssuesCompl: parseInt(statistics.numIssuesCompl),
        idIssuesAbiertas: statisticsAbiertas.map(
          (issue) => issue.idIssuesAbierta,
        ),
        difHorasCompletarIssues: statistics.difHorasCompletarIssues,
      };
      return result;
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async getUser(
    id_user: number,
    xml?: string,
  ): Promise<UserEntity | string | null> {
    const UserEntity = await this.usersRepository.findOneBy({ id_user });

    if (UserEntity != null) {
      if (xml == 'true') {
        const jsonformatted = JSON.stringify(UserEntity);
        return this.utilsService.convertJSONtoXML(jsonformatted);
      } else {
        return UserEntity;
      }
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const UserEntity = await this.usersRepository.findOne({
      where: { id_user: updateUserDto.id_user },
    });

    if (!UserEntity) {
      throw new Error('Usuario no encontrado');
    }

    this.usersRepository.merge(UserEntity, updateUserDto);
    return this.usersRepository.save(UserEntity);
  }

  async deleteUser(id_user: number): Promise<void> {
    await this.usersRepository.delete(id_user);
  }
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const UserEntity = await this.usersRepository.findOne({ where: { email } });
    if (UserEntity && (await bcrypt.compare(password, UserEntity.password))) {
      return UserEntity;
    }
    return null;
  }
  async getStaticTechnician(
    id_user: string,
  ): Promise<UserEntity | string | null> {
    const userId = parseInt(id_user.toString(), 10);
    if (isNaN(userId)) {
      throw new HttpException('Invalid UserEntity ID', HttpStatus.BAD_REQUEST);
    }

    const technician = await this.usersRepository.findOne({
      where: { id_user: userId, role: 2 },
    });

    if (!technician) {
      throw new HttpException(
        'El usuario no es un técnico',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const stats = await this.usersRepository
        .createQueryBuilder('UserEntity')
        .innerJoin('issue', 'issue', 'UserEntity.id_user = issue.id_tecnic')
        .where('UserEntity.id_user = :userId', { userId })
        .andWhere('UserEntity.role = :role', { role: 2 })
        .select('UserEntity.id_user AS id_user')
        .addSelect('UserEntity.name AS name')
        .addSelect('UserEntity.surname AS surname')
        .addSelect('COUNT(issue.id_issue) AS total_issues')
        .addSelect('SUM(issue.id_status = 4) AS Completadas')
        .addSelect('SUM(issue.id_status = 3) AS Canceladas')
        .addSelect('SUM(issue.id_status = 2) AS Abiertas')
        .addSelect('SUM(issue.id_status = 1) AS Creaddas')
        .addSelect(
          `
          SEC_TO_TIME(
              IFNULL(
                  AVG(
                      IF(issue.id_status = 4, TIMESTAMPDIFF(SECOND, issue.created_at, issue.last_updated), NULL)
                  ),
                  0
              )
          ) AS Media_tiempo_resolucion
        `,
        )
        .groupBy('UserEntity.id_user')
        .getRawOne();

      if (!stats) {
        throw new HttpException(
          'No se encontraron estadísticas para este técnico',
          HttpStatus.NOT_FOUND,
        );
      }

      return stats;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err.message || 'Error interno en el servidor',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }
}
