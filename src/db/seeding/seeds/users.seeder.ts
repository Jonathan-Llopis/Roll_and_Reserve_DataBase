import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import userData from '../../../data/inventory_users';
import { UserEntity } from '../../../users/users.entity';
import * as bcrypt from 'bcryptjs';

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);

    const userEntries = await Promise.all(
      userData.map(async (item) => {
        const userEntry = new UserEntity();
        userEntry.name = item.name;
        userEntry.surname = item.surname;
        const passwordHash = await bcrypt.hash(item.password, 10);
        userEntry.password = passwordHash;
        userEntry.email = item.email;
        userEntry.role = item.role;

        return userEntry;
      }),
    );

    await userRepository.save(userEntries);

    console.log('Users seeding completed!');
  }
}
