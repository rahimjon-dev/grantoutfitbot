import { config } from '../config/index.js';

export function adminAuthMiddleware(req, res, next) {
  // 1. Check if user was already verified via Telegram and is in configured adminIds list
  if (req.telegramUser && config.adminIds.length > 0 && config.adminIds.includes(req.telegramUser.id)) {
    req.isAdmin = true;
    return next();
  }

  // 2. Check admin header key if ADMIN_SECRET_KEY is securely configured
  const adminKey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (
    config.adminSecretKey &&
    config.adminSecretKey.length >= 8 &&
    ((adminKey && adminKey === config.adminSecretKey) ||
     (bearerToken && bearerToken === config.adminSecretKey))
  ) {
    req.isAdmin = true;
    req.telegramUser = req.telegramUser || {
      id: config.adminIds[0] || 1,
      first_name: 'Admin',
      username: 'store_admin'
    };
    return next();
  }

  // 3. In development ONLY: allow explicit dev test bypass if ALLOW_DEV_ADMIN is strictly enabled
  if (config.nodeEnv === 'development' && config.allowDevAdmin && req.headers['x-dev-admin'] === 'true') {
    req.isAdmin = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'FORBIDDEN',
    message: 'Access denied: Administrator privileges required'
  });
}
