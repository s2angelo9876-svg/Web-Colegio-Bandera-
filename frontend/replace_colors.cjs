const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src')).filter(f => f.endsWith('.jsx'));

const replacements = [
    { regex: /\[#003087\]/g, replacement: 'primary' },
    { regex: /\[#001D52\]/g, replacement: 'primary-dark' },
    { regex: /\[#DC2626\]/g, replacement: 'accent' },
    { regex: /\[#FEF2F2\]/g, replacement: 'accent-light' },
    { regex: /\[#F8FAFC\]/g, replacement: 'surface' },
    { regex: /\[#E2E8F0\]/g, replacement: 'border' }
];

let changedFiles = 0;
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedFiles++;
    }
}

console.log(`Replaced hardcoded colors in ${changedFiles} files.`);
