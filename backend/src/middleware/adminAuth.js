import { config } from '../config/index.js';

export function adminAuthMiddleware(req, res, next) {
  // 1. Check if user was already verified via Telegram and is an admin
  if (req.telegramUser && config.adminIds.includes(req.telegramUser.id)) {
    req.isAdmin = true;
    return next();
  }

  // 2. Check admin header key
  const adminKey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (
    (adminKey && adminKey === config.adminSecretKey) ||
    (bearerToken && bearerToken === config.adminSecretKey)
  ) {
    req.isAdmin = true;
    req.telegramUser = req.telegramUser || {
      id: config.adminIds[0] || 1,
      first_name: 'Admin',
      username: 'store_admin'
    };
    return next();
  }

  // In development, if no adminIds are configured or dev test bypass
  if (config.nodeEnv === 'development' && req.headers['x-dev-admin'] === 'true') {
    req.isAdmin = true;
    return next();
  }

  return res.status(403).json({
    error: 'FORBIDDEN',
    message: 'Access denied: Administrator privileges required'
  });
}
