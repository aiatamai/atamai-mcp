/**
 * Database Seeding Script
 * Initializes the database with seed data including libraries, users, and documentation
 *
 * Usage:
 *   npm run seed        # Run seeding after compilation
 *   Or directly:
 *     ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { seedUsers } from './users.seed';
import { seedLibraries } from './libraries.seed';

// Load environment variables
config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'context7',
    entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
    synchronize: false,
    logging: true,
  });

  try {
    console.log('🌍 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connection established');

    console.log('\n🌱 Starting seed process...\n');

    // Seed test users with different tiers
    await seedUsers(dataSource);

    // Seed libraries and documentation
    console.log('\n📚 Seeding libraries...');
    await seedLibraries(dataSource);

    console.log('\n✨ Seeding complete!');
    console.log('\n📋 Test User Credentials:');
    console.log('   Free Tier:       free@example.com / Password123!');
    console.log('   Pro Tier:        pro@example.com / Password123!');
    console.log('   Enterprise Tier: enterprise@example.com / Password123!');
    console.log('   Admin:           admin@example.com / Password123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the seed
seed();
