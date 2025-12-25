import { Injectable, CanActivate, ExecutionContext, TooManyRequestsException } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitingService } from './rate-limiting.service';
import { User } from '../../database/entities/user.entity';

/**
 * Rate limiting guard that checks against user/API key rate limits
 * Extracts user from request (either from JWT or API key authentication)
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitingService: RateLimitingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Extract user from request (set by auth guards)
    const user: User = request.user as User;

    if (!user) {
      // No user attached, allow (unauthenticated endpoints)
      return true;
    }

    // Use user ID as the rate limit key
    const limitKey = `user:${user.id}`;

    // Get the user's rate limits based on tier
    const limitRpm = this.getRateLimitRpm(user.tier);
    const limitRpd = this.getRateLimitRpd(user.tier);

    // Check rate limit
    const result = await this.rateLimitingService.checkRateLimit(
      limitKey,
      limitRpm,
      limitRpd,
    );

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Reset at ${result.resetAt.toISOString()}`,
      );
    }

    return true;
  }

  private getRateLimitRpm(tier: string): number {
    const limits = {
      free: 50,
      pro: 500,
      enterprise: 5000,
    };
    return limits[tier.toLowerCase()] || 50;
  }

  private getRateLimitRpd(tier: string): number {
    const limits = {
      free: 1000,
      pro: 50000,
      enterprise: 1000000,
    };
    return limits[tier.toLowerCase()] || 1000;
  }
}
