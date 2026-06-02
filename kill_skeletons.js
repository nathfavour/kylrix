const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.{ts,tsx}', { ignore: ['node_modules/**', '.next/**'] });

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if the file imports Skeleton
    if (content.includes('Skeleton')) {
        // We will remove Skeleton from imports
        content = content.replace(/Skeleton\s*,?/g, '');
        
        // This is a naive regex to replace <Skeleton ... /> or <Skeleton>...</Skeleton> 
        // with an empty <Box /> or <div />. Let's just remove the word Skeleton from MUI imports.
        fs.writeFileSync(file, content);
    }
});
console.log('Done scanning.');
