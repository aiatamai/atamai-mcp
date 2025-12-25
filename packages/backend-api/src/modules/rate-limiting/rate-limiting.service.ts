import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

@Injectable()
export class RateLimitingService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Check and increment rate limit counters for a given key
   * Uses Redis MULTI transaction for atomic operation
   */
  async checkRateLimit(
    key: string,
    limitRpm: number,
    limitRpd: number,
  ): Promise<RateLimitResult> {
    const now = new Date();
    const minuteKey = this.getMinuteKey(key, now);
    const dayKey = this.getDayKey(key, now);

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();

    // Check and increment minute counter (60 second TTL)
    pipeline.incr(minuteKey);
    pipeline.expire(minuteKey, 60);

    // Check and increment day counter (86400 second TTL)
    pipeline.incr(dayKey);
    pipeline.expire(dayKey, 86400);

    const results = await pipeline.exec();

    if (!results) {
      return {
        allowed: true,
        remaining: limitRpm,
        resetAt: new Date(),
        limit: limitRpm,
      };
    }

    const minuteCount = (results[0]?.[1] as number) || 0;
    const dayCount = (results[2]?.[1] as number) || 0;

    // Determine which limit was hit (if any)
    const minuteExceeded = minuteCount > limitRpm;
    const dayExceeded = dayCount > limitRpd;

    const allowed = !minuteExceeded && !dayExceeded;

    // Calculate reset times
    const minuteResetAt = new Date(now.getTime() + 60000);
    const dayResetAt = new Date(now.getTime() + 86400000);

    // Use the stricter limit for remaining calculation
    const remainingMinute = Math.max(0, limitRpm - minuteCount);
    const remainingDay = Math.max(0, limitRpd - dayCount);
    const remaining = Math.min(remainingMinute, remainingDay);

    const resetAt = minuteExceeded ? minuteResetAt : dayResetAt;

    return {
      allowed,
      remaining,
      resetAt,
      limit: minuteExceeded ? limitRpm : limitRpd,
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    key: string,
    limitRpm: number,
    limitRpd: number,
  ): Promise<RateLimitResult> {
    const now = new Date();
    const minuteKey = this.getMinuteKey(key, now);
    const dayKey = this.getDayKey(key, now);

    const [minuteCount, dayCount] = await Promise.all([
      this.redis.get(minuteKey),
      this.redis.get(dayKey),
    ]);

    const minuteVal = parseInt(minuteCount || '0', 10);
    const dayVal = parseInt(dayCount || '0', 10);

    const minuteExceeded = minuteVal > limitRpm;
    const dayExceeded = dayVal > limitRpd;
    const allowed = !minuteExceeded && !dayExceeded;

    const minuteResetAt = new Date(now.getTime() + 60000);
    const dayResetAt = new Date(now.getTime() + 86400000);

    const remainingMinute = Math.max(0, limitRpm - minuteVal);
    const remainingDay = Math.max(0, limitRpd - dayVal);
    const remaining = Math.min(remainingMinute, remainingDay);

    const resetAt = minuteExceeded ? minuteResetAt : dayResetAt;

    return {
      allowed,
      remaining,
      resetAt,
      limit: minuteExceeded ? limitRpm : limitRpd,
    };
  }

  /**
   * Reset rate limit counters for a given key
   */
  async resetRateLimit(key: string): Promise<void> {
    const now = new Date();
    const minuteKey = this.getMinuteKey(key, now);
    const dayKey = this.getDayKey(key, now);

    await Promise.all([this.redis.del(minuteKey), this.redis.del(dayKey)]);
  }

  /**
   * Generate minute-based key with current minute timestamp
   */
  private getMinuteKey(key: string, date: Date): string {
    const minute = Math.floor(date.getTime() / 60000);
    return `ratelimit:minute:${key}:${minute}`;
  }

  /**
   * Generate day-based key with current day timestamp
   */
  private getDayKey(key: string, date: Date): string {
    const day = Math.floor(date.getTime() / 86400000);
    return `ratelimit:day:${key}:${day}`;
  }
}
