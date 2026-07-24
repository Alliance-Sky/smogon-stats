const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const dirsToScan = ['src', 'public'];
let allFiles = [];
dirsToScan.forEach(dir => {
    if(fs.existsSync(dir)) {
        allFiles = allFiles.concat(walkSync(dir));
    }
});
allFiles.push('index.html');

const removeCommentsAndEmojis = (content, ext) => {
    // Remove emojis
    let newContent = content.replace(/\p{Emoji_Presentation}/gu, '');
    
    if (ext === '.js' || ext === '.jsx') {
        // Remove JSX comments: { /* ... */ }
        newContent = newContent.replace(/{\s*\/\*[\s\S]*?\*\/\s*}/g, '');

        // Remove regular JS comments while preserving strings and regex literals.
        const regex = /(".*?"|'.*?'|`[\s\S]*?`)|(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)/g;
        newContent = newContent.replace(regex, (match, string, blockComment, lineComment) => {
            if (string) return string;
            return '';
        });
    } else if (ext === '.css') {
        newContent = newContent.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (ext === '.html') {
        newContent = newContent.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    return newContent;
};

allFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    const ext = path.extname(file);
    if (!['.js', '.jsx', '.css', '.html'].includes(ext)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    content = removeCommentsAndEmojis(content, ext);
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Cleaned: ' + file);
    }
});
