import { ApiProperty } from '@nestjs/swagger';
import { UserTier } from '../../../database/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  tier: UserTier;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
