import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Validates Telegram Web App initData using HMAC-SHA256
 * Spec: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function verifyTelegramInitData(initDataRaw, botToken) {
  if (!initDataRaw || !botToken) return null;

  try {
    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    urlParams.delete('hash');

    // Sort parameters alphabetically
    const params = Array.from(urlParams.entries());
    params.sort(([a], [b]) => a.localeCompare(b));

    const dataCheckString = params
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // secret_key = HMAC_SHA256(botToken, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // calculated_hash = HMAC_SHA256(dataCheckString, secretKey)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
    const receivedBuffer = Buffer.from(hash, 'hex');

    if (calculatedBuffer.length !== receivedBuffer.length) {
      return null;
    }

    const isValid = crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
    if (!isValid) return null;

    // Check auth_date freshness (allow up to 86400 seconds = 24 hours)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400 * 7) {
      // 7 days window for mini app caching
      return null;
    }

    const userRaw = urlParams.get('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    return {
      user,
      queryId: urlParams.get('query_id'),
      authDate,
      startParam: urlParams.get('start_param')
    };
  } catch (err) {
    console.error('Error validating Telegram initData:', err);
    return null;
  }
}

/**
 * Express Middleware to authenticate incoming requests via Telegram Mini App
 */
export function telegramAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const initDataHeader = req.headers['x-telegram-init-data'];
  const initData = initDataHeader || (authHeader?.startsWith('tma ') ? authHeader.slice(4) : null);

  // In development mode, allow mock user if no bot token or initData is explicitly 'mock'
  if (config.nodeEnv === 'development' && (!config.botToken || initData === 'mock' || !initData)) {
    // If dev mock header is passed or no auth provided in dev, provide dev user
    const mockId = req.headers['x-mock-telegram-id'] || '999888777';
    req.telegramUser = {
      id: Number(mockId),
      first_name: req.headers['x-mock-first-name'] || 'Alex',
      last_name: req.headers['x-mock-last-name'] || 'Tashkent',
      username: 'alextashkent',
      language_code: 'uz'
    };
    req.isAdmin = config.adminIds.includes(req.telegramUser.id);
    return next();
  }

  if (!initData) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing Telegram authorization header' });
  }

  const verified = verifyTelegramInitData(initData, config.botToken);

  if (!verified || !verified.user) {
    return res.status(401).json({ error: 'INVALID_AUTH', message: 'Invalid Telegram Web App signatures' });
  }

  req.telegramUser = verified.user;
  req.isAdmin = config.adminIds.includes(verified.user.id);
  next();
}
