const fs = require('fs');
// Source - https://stackoverflow.com/a
// Posted by h-sifat, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-26, License - CC BY-SA 4.0

const path = require("path");


function emptyDir(dirPath) {
    const dirContents = fs.readdirSync(dirPath); // List dir content

    for (const fileOrDirPath of dirContents) {
        try {
            // Get Full path
            const fullPath = path.join(dirPath, fileOrDirPath);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !fullPath.endsWith('.asar')) {
                // It's a sub directory
                if (fs.readdirSync(fullPath).length) emptyDir(fullPath);
                // If the dir is not empty then remove it's contents too(recursively)
                fs.rmdirSync(fullPath);
            } else fs.unlinkSync(fullPath); // It's a file
        } catch (ex) {
            console.error(ex.message);
        }
    }
    fs.rmdirSync(dirPath);
}
module.exports = emptyDir;