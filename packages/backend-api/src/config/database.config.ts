import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
    migrationsRun: true,
    synchronize: !isProduction,
    dropSchema: false,
    logging: !isProduction ? ['query', 'error'] : ['error'],
    maxQueryExecutionTime: 1000,
    poolSize: isProduction ? 20 : 10,
    cache: {
      type: 'redis',
      options: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
      duration: 60000,
    },
  };
};
