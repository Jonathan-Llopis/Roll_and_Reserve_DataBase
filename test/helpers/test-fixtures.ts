import { UserEntity } from '../../src/users/users.entity';
import { ShopsEntity } from '../../src/shops/shops.entity';
import { TablesEntity } from '../../src/tables/tables.entity';
import { ReservesEntity } from '../../src/reserves/reserves.entity';

export const createMockUser = (overrides?: Partial<UserEntity>): UserEntity => ({
  id_user: 1,
  id_google: null,
  username: 'testuser',
  name: 'Test User',
  password: 'hashedPassword123',
  email: 'test@example.com',
  role: 0,
  tokenExpiration: null,
  token: null,
  avatar: null,
  average_raiting: 4.5,
  token_notification: 'fcm-token-123',
  writtenReviews: [],
  receivedReviews: [],
  shop_owned: [],
  users_reserve: [],
  ...overrides,
});

export const createMockShop = (overrides?: Partial<ShopsEntity>): ShopsEntity => ({
  id_shop: 1,
  name: 'Dungeon & Dice',
  address: 'Calle Mayor 1',
  logo: 'logo-mock-id',
  latitud: 38.82,
  longitud: -0.6,
  owner: createMockUser({ role: 1 }),
  reviews_shop: [],
  games: [],
  tables_in_shop: [],
  ...overrides,
});

export const createMockTable = (overrides?: Partial<TablesEntity>): TablesEntity => ({
  id_table: 1,
  number_table: 1,
  tables_of_shop: createMockShop(),
  reserves_of_table: [],
  ...overrides,
});

export const createMockReserve = (overrides?: Partial<ReservesEntity>): ReservesEntity => ({
  id_reserve: 1,
  total_places: 4,
  reserver_id: '1',
  hour_start: new Date('2026-11-15T18:00:00Z'),
  hour_end: new Date('2026-11-15T20:00:00Z'),
  description: 'Partida de Catan',
  required_material: 'Juego base',
  shop_event: false,
  event_id: null,
  confirmation_notification: false,
  difficulty: null,
  reserve_of_game: null,
  reserve_table: createMockTable(),
  users_in_reserve: [],
  userReserves: [],
  ...overrides,
});
