export const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
});
