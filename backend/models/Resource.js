// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['tool', 'database', 'course', 'website'],
    required: true 
  },
  tags: [{ type: String }],
  url: { type: String, required: true },
  popularity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);