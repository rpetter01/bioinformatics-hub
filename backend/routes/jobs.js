// /backend/routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search jobs by tags, title, or company (public)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const jobs = await Job.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;