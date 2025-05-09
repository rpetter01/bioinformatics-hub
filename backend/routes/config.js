// routes/config.js - Configuration API Routes for Store Button
const express = require('express');
const { join } = require('path');
const fs = require('fs').promises;
const { checkJwt, checkAdmin } = require('../middleware/auth');

const router = express.Router();
const dataPath = join(__dirname, '../data/config.json');

// Helper function to read config data
async function getConfig() {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write config data
async function saveConfig(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET store button config - public route
router.get('/store-button', async (req, res) => {
  try {
    const config = await getConfig();
    res.json(config.storeButton);
  } catch (error) {
    console.error('Error fetching store button config:', error);
    res.status(500).json({ error: 'Failed to fetch store button config' });
  }
});

// PUT update store button config - protected admin route
router.put('/store-button', checkJwt, checkAdmin, async (req, res) => {
  try {
    const { text, url, enabled } = req.body;
    
    // Validate required fields
    if (text === undefined || url === undefined || enabled === undefined) {
      return res.status(400).json({
        error: 'Missing required fields (text, url, enabled)'
      });
    }
    
    const config = await getConfig();
    
    // Update store button configuration
    config.storeButton = {
      text,
      url,
      enabled
    };
    
    // Save updated config
    await saveConfig(config);
    
    res.json(config.storeButton);
  } catch (error) {
    console.error('Error updating store button config:', error);
    res.status(500).json({ error: 'Failed to update store button config' });
  }
});

module.exports = router;