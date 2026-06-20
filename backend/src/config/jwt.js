export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key',
  accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};
