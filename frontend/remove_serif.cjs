const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(srcDir);
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove "font-serif" and "italic" that were used to create the editorial typography look
    // Be careful to only remove them from classNames.
    // Given the previous usage, it was typically "italic font-serif", "font-serif italic", etc.
    let changed = false;
    
    const newContent = content.replace(/className=(['"])(.*?)\1/g, (match, quote, classes) => {
        const originalClasses = classes;
        // Specifically replacing font-serif and stylistic italics associated with it
        let updatedClasses = classes.replace(/\bfont-serif\b/g, '').replace(/\bitalic\b/g, '');
        // normalize spaces
        updatedClasses = updatedClasses.replace(/\s+/g, ' ').trim();
        
        if (originalClasses !== updatedClasses) {
            changed = true;
            return `className=${quote}${updatedClasses}${quote}`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, newContent, 'utf8');
        modifiedCount++;
    }
});

console.log(`Replaced font classes in ${modifiedCount} files.`);
