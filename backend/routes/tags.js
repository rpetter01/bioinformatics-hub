// routes/tags.js - Tags API Routes
const express = require('express');
const { join } = require('path');
const fs = require('fs').promises;
const { checkJwt, checkAdmin } = require('../middleware/auth');

const router = express.Router();
const dataPath = join(__dirname, '../data/tags.json');

// Helper function to read tags data
async function getTags() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist yet, return empty structure
    return { tags: [] };
  }
}

// Helper function to write tags data
async function saveTags(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET all tags - public route
router.get('/', async (req, res) => {
  try {
    const data = await getTags();
    res.json(data.tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Basic routes for now
router.post('/', checkJwt, checkAdmin, async (req, res) => {
  res.json({ message: 'Create tag route' });
});

router.delete('/:id', checkJwt, checkAdmin, async (req, res) => {
  res.json({ message: 'Delete tag route' });
});

module.exports = router;