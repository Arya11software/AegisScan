import express from 'express';
import { scannerService } from '../services/scannerService.js';
import { profileTargetRepository, discoverAttackSurface } from '../services/targetProfiler.js';
import { targetService } from '../services/targetService.js';

const router = express.Router();

// GET /api/target - Target details
router.get('/target', (req, res) => {
  try {
    const profile = profileTargetRepository();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attack-surface - Attack surface discovery
router.get('/attack-surface', (req, res) => {
  try {
    const surface = discoverAttackSurface();
    res.json({ success: true, surface });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/security-checks - List available security checks
router.get('/security-checks', (req, res) => {
  res.json({
    success: true,
    checks: scannerService.getAvailableChecks()
  });
});

// POST /api/security-checks/run - Run specific security check or all checks
router.post('/security-checks/run', (req, res) => {
  try {
    const { checkId = 'REAL-CHK-001' } = req.body;
    const result = scannerService.runCheck(checkId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
