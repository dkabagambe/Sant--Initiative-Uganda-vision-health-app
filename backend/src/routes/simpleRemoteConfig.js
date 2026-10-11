const express = require('express');
const router = express.Router();

/**
 * Simple Remote Config — serves the canonical API base URL to the app.
 *
 * Security:
 *   All write operations (PATCH /, POST /reset, POST /emergency-url) require
 *   the request header  x-config-secret: <value of REMOTE_CONFIG_SECRET env var>
 *   on the server.  If REMOTE_CONFIG_SECRET is not set the server returns 503
 *   so misconfigured deployments fail closed, not open.
 *
 *   The GET / read endpoint is public (the app needs it without a token).
 *
 * Persistence:
 *   Config is held in memory.  The canonical default is read from
 *   REMOTE_CONFIG_API_URL (env var) so restarts always restore the correct
 *   value, even if a PATCH was applied in a previous process.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────
const RENDER_URL = 'https://sante-initiative-uganda-app.onrender.com/api';

/** The URL this server considers canonical for the running deployment. */
const getCanonicalUrl = () =>
  (process.env.REMOTE_CONFIG_API_URL || '').trim() || RENDER_URL;

/** Reject writes that would redirect Render-based apps back to Vercel. */
const isVercelUrl = (url) =>
  typeof url === 'string' && url.includes('vercel.app');

/** Validate the shared write secret. Returns an error response or null. */
const checkWriteSecret = (req, res) => {
  const secret = process.env.REMOTE_CONFIG_SECRET;
  if (!secret) {
    res.status(503).json({
      success: false,
      error: 'REMOTE_CONFIG_SECRET is not set on this server. Write operations are disabled.',
    });
    return false;
  }
  const provided = req.headers['x-config-secret'];
  if (!provided || provided !== secret) {
    res.status(403).json({
      success: false,
      error: 'Missing or invalid x-config-secret header.',
    });
    return false;
  }
  return true;
};

// ── In-memory config (resets to env-based canonical on every cold start) ──────
const defaultConfig = () => ({
  apiBaseUrl: getCanonicalUrl(),
  maintenanceMode: false,
  forceUpdateVersion: null,
  features: {
    paymentsEnabled: true,
    referralsEnabled: true,
    stockEnabled: true,
    reportsEnabled: true,
  },
  messages: {
    welcome: 'Welcome to Santé Initiative Vision Health App',
    maintenance: 'System under maintenance. Please try again later.',
    updateRequired: 'Please update to the latest version for best experience.',
  },
  lastUpdated: new Date().toISOString(),
});

let currentConfig = defaultConfig();

// ── Routes ────────────────────────────────────────────────────────────────────

// GET / — public, no auth required (app fetches this on startup)
router.get('/', (req, res) => {
  res.json({ success: true, data: currentConfig });
});

// PATCH / — update config fields (write-secret required)
router.patch('/', (req, res) => {
  if (!checkWriteSecret(req, res)) return;

  const allowed = ['apiBaseUrl', 'maintenanceMode', 'forceUpdateVersion', 'features', 'messages'];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }

  // Safety: never redirect Render-based apps back to Vercel via this route
  if (updates.apiBaseUrl && isVercelUrl(updates.apiBaseUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Cannot set apiBaseUrl to a vercel.app domain via Render remote config.',
    });
  }

  currentConfig = { ...currentConfig, ...updates, lastUpdated: new Date().toISOString() };
  console.log('[remote-config] config updated:', JSON.stringify({ ...updates, apiBaseUrl: updates.apiBaseUrl ? '[set]' : undefined }));
  res.json({ success: true, message: 'Configuration updated', data: currentConfig });
});

// POST /reset — restore canonical defaults (write-secret required)
router.post('/reset', (req, res) => {
  if (!checkWriteSecret(req, res)) return;
  currentConfig = defaultConfig();
  res.json({ success: true, message: 'Configuration reset to default', data: currentConfig });
});

// POST /emergency-url — fast URL override (write-secret required)
router.post('/emergency-url', (req, res) => {
  if (!checkWriteSecret(req, res)) return;

  const { apiBaseUrl } = req.body;
  if (!apiBaseUrl || typeof apiBaseUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'apiBaseUrl is required.' });
  }
  if (isVercelUrl(apiBaseUrl)) {
    return res.status(400).json({
      success: false,
      error: 'Cannot set apiBaseUrl to a vercel.app domain via Render remote config.',
    });
  }

  currentConfig.apiBaseUrl = apiBaseUrl;
  currentConfig.lastUpdated = new Date().toISOString();
  console.log('[remote-config] emergency URL set:', apiBaseUrl);
  res.json({ success: true, message: 'Emergency API URL set', data: currentConfig });
});

module.exports = router;

