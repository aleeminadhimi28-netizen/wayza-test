const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content
    .replace(/â‚¹/g, '₹')
    .replace(/Ã—/g, '×')
    .replace(/â€”/g, '—')
    .replace(/ðŸ ¡/g, '🏡')
    .replace(/ðŸ  ï¸ /g, '🏍️');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
  }
});
