// /backend/scripts/testEnv.js
require('dotenv').config();

console.log('Testing environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined ✅' : 'Not defined ❌');
console.log('MONGODB_URI starts with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'N/A');