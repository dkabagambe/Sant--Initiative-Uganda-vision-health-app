/**
 * remoteConfig.js
 *
 * Legacy route kept for backward-compat with old app versions that call
 * POST /api/remote-config/update-api-url.
 *
 * Security: all write operations require the x-config-secret header
 * (value must match REMOTE_CONFIG_SECRET env var).  If the env var is
 * not set the server returns 503 — it fails closed, not open.
 *
 * The GET /status endpoint is public.
 */
const express = require('express');
const router = express.Router();

/** Validate the shared write secret. Returns false and sends a response on failure. */
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

// POST /update-api-url — requires write secret
router.post('/update-api-url', (req, res) => {
  if (!checkWriteSecret(req, res)) return;

  const { newUrl } = req.body;
  if (!newUrl || typeof newUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'newUrl is required.' });
  }
  try { new URL(newUrl); } catch {
    return res.status(400).json({ success: false, error: 'Invalid URL format.' });
  }

  res.json({
    success: true,
    message: 'API URL accepted',
    newUrl,
  });
});

// GET /status — public
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Remote configuration service is active',
    writeProtected: !!process.env.REMOTE_CONFIG_SECRET,
  });
});

module.exports = router;
