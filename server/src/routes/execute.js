import express from 'express';

const router = express.Router();

// Self-hosted Piston URL (can be overridden via environment variable in production)
const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

// Default runtime versions for Piston
const LANGUAGE_VERSIONS = {
  javascript: '18.15.0',
  typescript: '5.0.3',
  python: '3.12.0',
  cpp: '10.2.0',
  c: '10.2.0',
};

/**
 * GET /api/execute/runtimes
 * Get list of installed languages from Piston
 */
router.get('/runtimes', async (req, res) => {
  try {
    const response = await fetch(`${PISTON_URL}/api/v2/runtimes`);
    const runtimes = await response.json();
    res.json({ success: true, runtimes });
  } catch (error) {
    console.error('Error fetching runtimes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch runtimes' });
  }
});

/**
 * POST /api/execute
 * Execute code using Piston
 */
router.post('/', async (req, res) => {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required',
      });
    }

    // Convert 'cpp' to 'c++' for Piston
    const pistonLanguage = language === 'cpp' ? 'c++' : language.toLowerCase();
    const pistonVersion = LANGUAGE_VERSIONS[language.toLowerCase()] || '*';

    // Prepare payload for Piston API v2
    const payload = {
      language: pistonLanguage,
      version: pistonVersion,
      files: [{ name: 'main', content: code }],
      stdin: stdin,
    };

    // Send execution request to self-hosted Piston container
    const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    res.json({
      success: true,
      run: data.run,
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute code in Piston',
    });
  }
});

export default router;
