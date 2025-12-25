import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (): JwtModuleOptions => {
  const expiresIn = process.env.JWT_EXPIRATION || '24h';
  return {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    signOptions: {
      expiresIn: expiresIn as any,
    },
  };
};
