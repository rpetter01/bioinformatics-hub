// /backend/scripts/updateJobs.js
require('dotenv').config();
const mongoose = require('mongoose');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Load Job model
const Job = require('../models/Job');

// Run the Python scraper
const runPythonScraper = () => {
  return new Promise((resolve, reject) => {
    console.log('Running Python scraper...');
    
    // Path to your Python script
    const scriptPath = path.join(__dirname, 'job_scraper.py');
    
    // Run the Python script
    exec(`python ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return reject(error);
      }
      
      console.log(`Scraper output: ${stdout}`);
      if (stderr) console.error(`Scraper errors: ${stderr}`);
      
      resolve();
    });
  });
};

// Read jobs from JSON file and update MongoDB
const updateJobsInMongoDB = async () => {
  try {
    // Path to the JSON file produced by the scraper
    const jsonFilePath = path.join(__dirname, '../public/data/bioinformatics_jobs.json');
    
    // Read and parse the JSON file
    const fileData = await fs.readFile(jsonFilePath, 'utf8');
    const jobsData = JSON.parse(fileData);
    
    console.log(`Found ${jobsData.job_count} jobs in JSON file`);
    
    // Get unique job URLs to check for existing jobs
    const jobUrls = jobsData.jobs.map(job => job.url);
    const existingJobs = await Job.find({ url: { $in: jobUrls } });
    const existingJobUrls = new Set(existingJobs.map(job => job.url));
    
    // Filter new jobs
    const newJobs = jobsData.jobs.filter(job => !existingJobUrls.has(job.url));
    
    // Insert new jobs
    if (newJobs.length > 0) {
      // Add isRemote field based on location
      const processedJobs = newJobs.map(job => ({
        ...job,
        isRemote: job.location.toLowerCase().includes('remote')
      }));
      
      await Job.insertMany(processedJobs);
      console.log(`✅ Added ${newJobs.length} new jobs to MongoDB`);
    } else {
      console.log('No new jobs to add');
    }
    
    // Clean up old jobs (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleteResult = await Job.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`Removed ${deleteResult.deletedCount} old jobs`);
    
    return true;
  } catch (error) {
    console.error('Error updating jobs:', error);
    return false;
  }
};

// Main function
const updateJobs = async () => {
  console.log('Starting job update process...');
  
  // Connect to MongoDB
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to MongoDB. Exiting...');
    process.exit(1);
  }
  
  try {
    // Run Python scraper
    await runPythonScraper();
    
    // Update MongoDB with scraped jobs
    await updateJobsInMongoDB();
    
    console.log('✅ Job update process completed successfully');
  } catch (error) {
    console.error('❌ Job update process failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the update process if called directly
if (require.main === module) {
  updateJobs().then(() => process.exit(0));
}

module.exports = updateJobs;