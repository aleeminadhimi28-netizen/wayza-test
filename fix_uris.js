const fs = require('fs');
const files = [
  'backend/scripts/master_reset.js',
  'backend/scratch/update_listing_test.js',
  'backend/scratch/update_listing_nomad.js',
  'backend/scratch/seed_experiences.js',
  'backend/scratch/cleanup_hotels.js',
  'backend/scratch/check_hotels.js'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/mongodb:\/\/wayza:[^@]+@[^'"]+['"]/g, 'process.env.MONGO_URI');
    
    // Add dotenv if not exists
    if (!content.includes('dotenv')) {
      content = "require('dotenv').config();\n" + content;
    }
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed URIs');
