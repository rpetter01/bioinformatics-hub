// routes/analytics.js - Analytics API Routes
const express = require('express');
const { join } = require('path');
const fs = require('fs').promises;
const { checkJwt, checkAdmin } = require('../middleware/auth');

const router = express.Router();
const dataPath = join(__dirname, '../data/analytics.json');

// Helper function to read analytics data
async function getAnalytics() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default structure if file doesn't exist yet
    return {
      pageViews: [],
      resourceClicks: [],
      popularSearches: [],
      storeButtonClicks: 0
    };
  }
}

// Helper function to write analytics data
async function saveAnalytics(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET analytics data - protected admin route
router.get('/', checkJwt, checkAdmin, async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST record page view - public route
router.post('/page-view', async (req, res) => {
  try {
    const analytics = await getAnalytics();
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's entry or create it
    const todayEntry = analytics.pageViews.find(entry => entry.date === today);
    if (todayEntry) {
      todayEntry.count++;
    } else {
      analytics.pageViews.push({ date: today, count: 1 });
    }
    
    // Keep only the last 30 days
    analytics.pageViews = analytics.pageViews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);
    
    // Save updated analytics
    await saveAnalytics(analytics);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording page view:', error);
    res.status(500).json({ error: 'Failed to record page view' });
  }
});

// POST record resource click - public route
router.post('/resource-click', async (req, res) => {
  try {
    const { resourceId, resourceName } = req.body;
    
    if (!resourceId || !resourceName) {
      return res.status(400).json({
        error: 'Missing required fields (resourceId, resourceName)'
      });
    }
    
    const analytics = await getAnalytics();
    
    // Find resource entry or create it
    const resourceEntry = analytics.resourceClicks.find(entry => entry.resource === resourceName);
    if (resourceEntry) {
      resourceEntry.clicks++;
    } else {
      analytics.resourceClicks.push({ 
        resource: resourceName, 
        resourceId, 
        clicks: 1 
      });
    }
    
    // Sort by clicks (descending)
    analytics.resourceClicks.sort((a, b) => b.clicks - a.clicks);
    
    // Save updated analytics
    await saveAnalytics(analytics);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording resource click:', error);
    res.status(500).json({ error: 'Failed to record resource click' });
  }
});

// POST record search term - public route
router.post('/search', async (req, res) => {
  try {
    const { term } = req.body;
    
    if (!term) {
      return res.status(400).json({
        error: 'Missing required field (term)'
      });
    }
    
    const analytics = await getAnalytics();
    
    // Find search term entry or create it
    const searchEntry = analytics.popularSearches.find(entry => entry.term.toLowerCase() === term.toLowerCase());
    if (searchEntry) {
      searchEntry.count++;
    } else {
      analytics.popularSearches.push({ term, count: 1 });
    }
    
    // Sort by count (descending) and keep top 20
    analytics.popularSearches = analytics.popularSearches
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    // Save updated analytics
    await saveAnalytics(analytics);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording search term:', error);
    res.status(500).json({ error: 'Failed to record search term' });
  }
});

// POST record store button click - public route
router.post('/store-button-click', async (req, res) => {
  try {
    const analytics = await getAnalytics();
    
    // Increment store button clicks
    analytics.storeButtonClicks = (analytics.storeButtonClicks || 0) + 1;
    
    // Save updated analytics
    await saveAnalytics(analytics);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording store button click:', error);
    res.status(500).json({ error: 'Failed to record store button click' });
  }
});

module.exports = router;