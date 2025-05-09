// routes/resources.js - Resources API Routes
const express = require('express');
const { join } = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { checkJwt, checkAdmin } = require('../middleware/auth');

const router = express.Router();
const dataPath = join(__dirname, '../data/resources.json');

// Helper function to read resources data
async function getResources() {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write resources data
async function saveResources(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET all resources - public route
router.get('/', async (req, res) => {
  try {
    const data = await getResources();
    res.json(data.resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET a single resource by ID - public route
router.get('/:id', async (req, res) => {
  try {
    const data = await getResources();
    const resource = data.resources.find(r => r.id === req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// POST create a new resource - protected admin route
router.post('/', checkJwt, checkAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags,
      url,
      featured = false
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !url) {
      return res.status(400).json({
        error: 'Missing required fields (name, description, category, url)'
      });
    }
    
    const data = await getResources();
    
    // Create new resource
    const newResource = {
      id: uuidv4(),
      name,
      description,
      category,
      tags: tags || [],
      url,
      featured,
      popularity: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Add to resources array
    data.resources.push(newResource);
    
    // Save updated data
    await saveResources(data);
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT update a resource - protected admin route
router.put('/:id', checkJwt, checkAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags,
      url,
      featured
    } = req.body;
    
    const data = await getResources();
    const resourceIndex = data.resources.findIndex(r => r.id === req.params.id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Update resource fields while preserving others
    const updatedResource = {
      ...data.resources[resourceIndex],
      name: name || data.resources[resourceIndex].name,
      description: description || data.resources[resourceIndex].description,
      category: category || data.resources[resourceIndex].category,
      tags: tags || data.resources[resourceIndex].tags,
      url: url || data.resources[resourceIndex].url,
      featured: featured !== undefined ? featured : data.resources[resourceIndex].featured,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Update the resource
    data.resources[resourceIndex] = updatedResource;
    
    // Save updated data
    await saveResources(data);
    
    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE a resource - protected admin route
router.delete('/:id', checkJwt, checkAdmin, async (req, res) => {
  try {
    const data = await getResources();
    const resourceIndex = data.resources.findIndex(r => r.id === req.params.id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Remove the resource
    data.resources.splice(resourceIndex, 1);
    
    // Save updated data
    await saveResources(data);
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

module.exports = router;