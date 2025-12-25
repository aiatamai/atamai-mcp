import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RateLimitingService } from './rate-limiting.service';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          db: 1, // Use DB 1 for rate limiting (separate from cache)
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: true,
          maxRetriesPerRequest: null,
        });

        redis.on('error', (err) => {
          console.error('[Redis] Connection error:', err.message);
        });

        redis.on('connect', () => {
          console.log('[Redis] Connected to rate limiting cache');
        });

        return redis;
      },
    },
    RateLimitingService,
  ],
  exports: [RateLimitingService, 'REDIS_CLIENT'],
})
export class RateLimitingModule {}
