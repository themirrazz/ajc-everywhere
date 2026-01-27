module.exports = function () {
    const path = require('path');
    const config = require('./config.js');
    const dir = path.join(__dirname);
    const pkgdir = path.join(dir, 'pkg');
    require('./pkg/game.asar/index.js');
};