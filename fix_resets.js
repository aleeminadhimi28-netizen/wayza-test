const fs = require('fs');
const files = ['backend/scripts/master_reset.js', 'backend/scripts/reset_all.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('process.env.NODE_ENV === "production"')) {
      content = content.replace(/(const mongoose = require\('mongoose'\);)/, "$1\n\nif (process.env.NODE_ENV === 'production') {\n  console.error('Cannot run reset scripts in production.');\n  process.exit(1);\n}\n");
      fs.writeFileSync(f, content);
    }
  }
});
console.log('Fixed reset scripts');
