/**
 * User Seeding Script
 * Creates test users with different subscription tiers
 */

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { ApiKey } from '../entities/api-key.entity';

export const testUsers = [
  {
    email: 'free@example.com',
    password: 'Password123!',
    tier: 'free' as const,
    name: 'Free User',
    description: 'Standard free tier user with limited API access',
  },
  {
    email: 'pro@example.com',
    password: 'Password123!',
    tier: 'pro' as const,
    name: 'Pro User',
    description: 'Pro tier user with enhanced API limits',
  },
  {
    email: 'enterprise@example.com',
    password: 'Password123!',
    tier: 'enterprise' as const,
    name: 'Enterprise User',
    description: 'Enterprise tier user with unlimited API access',
  },
  {
    email: 'admin@example.com',
    password: 'Password123!',
    tier: 'enterprise' as const,
    name: 'Admin User',
    description: 'Admin user with access to admin panel',
  },
];

const getRateLimits = (tier: 'free' | 'pro' | 'enterprise') => {
  const limits = {
    free: { rpm: 50, rpd: 1000 },
    pro: { rpm: 500, rpd: 50000 },
    enterprise: { rpm: 5000, rpd: 1000000 },
  };
  return limits[tier];
};

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const apiKeyRepo = dataSource.getRepository(ApiKey);

  console.log('👥 Starting user seeding...');

  for (const userData of testUsers) {
    try {
      let user = await userRepo.findOne({
        where: { email: userData.email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = userRepo.create({
          email: userData.email,
          password_hash: hashedPassword,
          tier: userData.tier,
          name: userData.name,
        });

        user = await userRepo.save(user);
        console.log(`✅ Created user: ${userData.email} (${userData.tier})`);

        // Create default API key for non-free users
        if (userData.tier !== 'free') {
          const limits = getRateLimits(userData.tier);
          const keyPrefix = `atm_live_${Math.random().toString(36).substring(2, 10)}`;

          const apiKey = apiKeyRepo.create({
            user_id: user.id,
            key_prefix: keyPrefix,
            key_hash: await bcrypt.hash(keyPrefix, 10),
            name: 'Default API Key',
            tier: userData.tier,
            is_active: true,
            rate_limit_rpm: limits.rpm,
            rate_limit_rpd: limits.rpd,
          });

          await apiKeyRepo.save(apiKey);
          console.log(`  📝 Created API key: ${keyPrefix} (${limits.rpm} rpm)`);
        }
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding user ${userData.email}:`, error);
    }
  }

  console.log('✨ User seeding complete!');
}
