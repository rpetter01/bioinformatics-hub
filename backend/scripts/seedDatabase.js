// /backend/scripts/seedDatabase.js
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Enhanced logging for troubleshooting
console.log('Starting database seeding...');

// Check if .env file exists
const envPath = path.resolve(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);

// Try to read the file directly
fs.readFile(envPath, 'utf8')
  .then(contents => {
    console.log('.env file found. First 20 chars:', contents.substring(0, 20));
    // Now load it with dotenv
    require('dotenv').config({ path: envPath });
  })
  .catch(err => {
    console.error('.env file could not be read:', err.message);
  })
  .finally(() => {
    // Continue with the script regardless
    console.log('Environment variables:');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Defined ✅' : 'Not defined ❌');
    
    // Continue with the rest of your script, but handle missing URI
    continueWithSeeding();
  });

// Move the rest of your script to this function
function continueWithSeeding() {
  console.log('Loading models...');
  
  // Define MongoDB URI directly as a fallback
  const MONGODB_URI = process.env.MONGODB_URI || 
    "mongodb+srv://adminhub:your_actual_password@bioinfohubcluster.yolhmia.mongodb.net/?retryWrites=true&w=majority&appName=bioinfohub";
  
  async function seedDatabase() {
    try {
      console.log('Connecting to MongoDB directly with URI...');
      
      // Connect directly instead of using connectDB
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected!');
      
      // Reading resources file
      console.log('Reading JSON data files...');
      const resourcesFilePath = path.join(__dirname, '../data/resources.json');
      console.log(`Looking for resources at: ${resourcesFilePath}`);
      
      // Check if file exists
      try {
        await fs.access(resourcesFilePath);
        console.log('✅ Resources file exists!');
      } catch (err) {
        console.error('❌ Resources file does not exist:', err.message);
        console.log('Creating sample resources file...');
        
        // Create a sample resources file
        const sampleResources = {
          resources: [
            {
              id: "blast",
              name: 'BLAST (NCBI)',
              description: 'Basic Local Alignment Search Tool for comparing biological sequence information',
              category: 'tool',
              tags: ['sequence alignment', 'genomics', 'NCBI'],
              url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
              popularity: 98,
              lastUpdated: '2025-05-01',
              featured: true
            },
            {
              id: "genbank",
              name: 'GenBank',
              description: 'Comprehensive genetic sequence database with annotated sequences',
              category: 'database',
              tags: ['genetics', 'sequence database', 'NCBI'],
              url: 'https://www.ncbi.nlm.nih.gov/genbank/',
              popularity: 95,
              lastUpdated: '2025-04-23',
              featured: true
            }
          ]
        };
        
        // Create the directory if it doesn't exist
        await fs.mkdir(path.dirname(resourcesFilePath), { recursive: true });
        
        // Write the sample file
        await fs.writeFile(resourcesFilePath, JSON.stringify(sampleResources, null, 2));
        console.log('✅ Created sample resources file!');
      }
      
      // Now read the file content
      console.log('Reading resources file content...');
      let resourcesData;
      try {
        const fileContent = await fs.readFile(resourcesFilePath, 'utf8');
        console.log(`File content length: ${fileContent.length} characters`);
        
        const parsedData = JSON.parse(fileContent);
        
        // Check if the data has a 'resources' property (your JSON structure)
        if (parsedData.resources && Array.isArray(parsedData.resources)) {
          resourcesData = parsedData.resources;
          console.log(`✅ Successfully parsed JSON with ${resourcesData.length} resources in 'resources' array`);
        } else if (Array.isArray(parsedData)) {
          // Handle direct array format if someone changes the file later
          resourcesData = parsedData;
          console.log(`✅ Successfully parsed JSON with ${resourcesData.length} resources in direct array`);
        } else {
          throw new Error('JSON does not contain a resources array');
        }
      } catch (err) {
        console.error('❌ Error reading or parsing resources file:', err.message);
        console.log('File might contain invalid JSON or unexpected structure. Please check the syntax.');
        return;
      }
      
      // Create the Resource model with the appropriate schema
      console.log('Creating Resource model...');
      const ResourceSchema = new mongoose.Schema({
        id: String,
        name: String,
        description: String,
        category: String,
        tags: [String],
        url: String,
        popularity: Number,
        lastUpdated: String,
        featured: Boolean
      });
      
      // Check if model already exists to avoid overwriting
      const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
      
      // Now try to save to MongoDB
      console.log('Saving resources to MongoDB...');
      
      // Track operation results
      let added = 0;
      let skipped = 0;
      let errors = 0;
      
      // Process each resource
      for (const resource of resourcesData) {
        try {
          // Check if this resource already exists by id
          const exists = await Resource.findOne({ id: resource.id });
          
          if (!exists) {
            // Only add if it doesn't exist
            await Resource.create(resource);
            added++;
            console.log(`✅ Added: ${resource.name} (${resource.id})`);
          } else {
            skipped++;
            console.log(`Skipped (already exists): ${resource.name} (${resource.id})`);
          }
        } catch (err) {
          console.error(`❌ Error adding resource ${resource.name}:`, err.message);
          errors++;
        }
      }
      
      console.log(`\n==== SEEDING COMPLETE ====`);
      console.log(`✅ Resources added: ${added}`);
      console.log(`⏭️ Resources skipped: ${skipped}`);
      console.log(`❌ Errors: ${errors}`);
      console.log(`Total resources processed: ${resourcesData.length}`);
      
      // Close connection
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      
    } catch (error) {
      console.error('❌ Error in seeding process:', error);
    } finally {
      process.exit(0);
    }
  }
  
  // Call the function
  seedDatabase();
}