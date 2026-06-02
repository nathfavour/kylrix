const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('app').concat(walk('components'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Remove Skeleton from MUI imports
    if (content.match(/Skeleton\s*,/)) {
        content = content.replace(/Skeleton\s*,/g, '');
        changed = true;
    }
    if (content.match(/,\s*Skeleton/)) {
        content = content.replace(/,\s*Skeleton/g, '');
        changed = true;
    }

    // Replace the definition of xxxSkeleton functions and consts with returning null
    if (content.match(/function\s+[A-Za-z0-9_]*Skeleton\s*\(\)\s*\{[\s\S]*?return\s*\([\s\S]*?\);\s*\}/)) {
        content = content.replace(/function\s+([A-Za-z0-9_]*Skeleton)\s*\(\)\s*\{[\s\S]*?return\s*\([\s\S]*?\);\s*\}/g, 'function $1() { return null; }');
        changed = true;
    }

    if (content.match(/const\s+[A-Za-z0-9_]*Skeleton\s*=\s*\(\)\s*=>\s*\([\s\S]*?\);/)) {
        content = content.replace(/const\s+([A-Za-z0-9_]*Skeleton)\s*=\s*\(\)\s*=>\s*\([\s\S]*?\);/g, 'const $1 = () => null;');
        changed = true;
    }

    // Replace generic <Skeleton ... /> with null (but React needs fragments or actual elements, so replacing with null directly in JSX might break if not wrapped in braces. Let's replace with empty Fragments <></> or empty <Box/>? Wait, if we replace `<Skeleton... />` with `<></>`, it's perfectly valid JSX.)
    if (content.match(/<Skeleton[^>]*\/>/g)) {
        content = content.replace(/<Skeleton[^>]*\/>/g, '<></>');
        changed = true;
    }

    // Replace <xxxSkeleton /> with <></>
    if (content.match(/<[A-Za-z0-9_]*Skeleton[^>]*\/>/g)) {
        content = content.replace(/<[A-Za-z0-9_]*Skeleton[^>]*\/>/g, '<></>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Cleaned skeletons from ${file}`);
    }
});