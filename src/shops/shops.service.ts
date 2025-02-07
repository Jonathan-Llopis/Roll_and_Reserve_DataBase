import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsEntity } from './shops.entity';
import { CreateShopDto, UpdateShopDto } from './shops.dto';
import { UserEntity } from 'src/users/users.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAllShops(): Promise<ShopsEntity[]> {
    try {
      const shops = await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
      return shops;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getShop(id: number): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
      if (!shop) {
        throw new Error('Shop not found');
      }
      return shop;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllShopsByOwner(idOwner: string): Promise<ShopsEntity[]> {
    try {
      const shops = await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
        where: { owner: { id_google: idOwner } },
      });
      return shops;
    } catch (err) {
      throw new Error(err);
    }
  }

  async createShop(createShopDto: CreateShopDto): Promise<ShopsEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: { id_google: createShopDto.owner_id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      createShopDto.owner_id = user.id_user.toString();

      const shop = this.shopRepository.create(createShopDto);
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateShop(
    updateShopDto: UpdateShopDto,
    id: number,
  ): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
      });
      if (!shop) {
        throw new Error('Shop not found');
      }

      if (updateShopDto.owner_id) {
        const user = await this.userRepository.findOne({
          where: { id_google: updateShopDto.owner_id },
        });

        if (!user) {
          throw new Error('User not found');
        }

        updateShopDto.owner_id = user.id_user.toString();
      }

      Object.assign(shop, updateShopDto);
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteShop(id: number): Promise<void> {
    try {
      await this.shopRepository.delete(id);
    } catch (err) {
      throw new Error(err);
    }
  }

  async vincularArchivo(id_shop: string, id_archivo: string) {
    const shop = await this.shopRepository.findOne({
      where: { id_shop: parseInt(id_shop) },
    });

    if (!shop) {
      throw new HttpException('Tienda no encontrada', HttpStatus.NOT_FOUND);
    }
    shop.logo = id_archivo.toString();
    return this.shopRepository.save(shop);
  }
}
