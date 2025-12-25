import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserTier } from '../../database/entities/user.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userRepository.save({
      email: registerDto.email,
      password_hash: hashedPassword,
      tier: UserTier.FREE,
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async validateApiKey(keyHash: string): Promise<User | null> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        key_hash: keyHash,
        is_active: true,
      },
      relations: ['user'],
    });

    if (!apiKey) {
      return null;
    }

    // Update last used timestamp
    apiKey.last_used_at = new Date();
    await this.apiKeyRepository.save(apiKey);

    return apiKey.user;
  }

  async generateApiKey(
    userId: string,
    name: string,
    tier: UserTier,
  ): Promise<{ key: string; keyId: string; prefix: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate random key
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const keyPrefix = `atm_${process.env.NODE_ENV === 'production' ? 'live' : 'test'}`;
    const fullKey = `${keyPrefix}_${randomBytes}`;

    // Hash the key for storage
    const keyHash = await bcrypt.hash(fullKey, 10);

    const apiKey = await this.apiKeyRepository.save({
      user_id: userId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name,
      tier,
      rate_limit_rpm: this.getRateLimitRpm(tier),
      rate_limit_rpd: this.getRateLimitRpd(tier),
    });

    return {
      key: fullKey,
      keyId: apiKey.id,
      prefix: keyPrefix,
    };
  }

  private generateTokens(user: User): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      tier: user.tier,
    };

    return {
      id: user.id,
      email: user.email,
      tier: user.tier,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  private getRateLimitRpm(tier: UserTier): number {
    const limits = {
      [UserTier.FREE]: 50,
      [UserTier.PRO]: 500,
      [UserTier.ENTERPRISE]: 5000,
    };
    return limits[tier] || 50;
  }

  private getRateLimitRpd(tier: UserTier): number {
    const limits = {
      [UserTier.FREE]: 1000,
      [UserTier.PRO]: 50000,
      [UserTier.ENTERPRISE]: 1000000,
    };
    return limits[tier] || 1000;
  }
}
