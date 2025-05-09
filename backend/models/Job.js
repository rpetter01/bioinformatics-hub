// /backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  tags: [{ type: String }],
  url: { type: String, required: true },
  source: { type: String, required: true },
  date_scraped: { type: String },
  posted_date: { type: String },
  isRemote: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);