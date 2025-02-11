import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopsEntity } from './shops.entity';
import { CreateShopDto, UpdateShopDto } from './shops.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopsEntity)
    private readonly shopRepository: Repository<ShopsEntity>,
  ) {}

  private handleError(err: any) {
    if (err instanceof HttpException) {
      throw err;
    }
    console.error(err);
    throw new HttpException('An unexpected error occurred', HttpStatus.BAD_REQUEST);
  }

  async getAllShops(): Promise<ShopsEntity[]> {
    try {
      return await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async getShop(id: number): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
      });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      return shop;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getAllShopsByOwner(idOwner: string): Promise<ShopsEntity[]> {
    try {
      return await this.shopRepository.find({
        relations: ['games', 'tables_in_shop', 'reviews_shop', 'owner'],
        where: { owner: { id_google: idOwner } },
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  async createShop(createShopDto: CreateShopDto): Promise<ShopsEntity> {
    try {
      const shop = this.shopRepository.create(createShopDto);
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateShop(updateShopDto: UpdateShopDto, id: number): Promise<ShopsEntity> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: id },
      });
      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      Object.assign(shop, updateShopDto);
      await this.shopRepository.save(shop);
      return shop;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteShop(id: number): Promise<void> {
    try {
      const result = await this.shopRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  async vincularArchivo(id_shop: string, id_archivo: string) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { id_shop: parseInt(id_shop) },
      });

      if (!shop) {
        throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);
      }
      shop.logo = id_archivo.toString();
      return this.shopRepository.save(shop);
    } catch (err) {
      this.handleError(err);
    }
  }
}
