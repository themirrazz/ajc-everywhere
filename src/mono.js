module.exports = function (url, options = {}) {
    if(!options.width) options.width = 500;
    if(!options.height) options.height = 700;
    const { BrowserWindow, app } = require('electron');
    app.whenReady().then(() => {
        const br = new BrowserWindow({
            width: options.width,
            height: options.height,
            webPreferences: {
                sandbox: true,
                plugins: false,
                webviewTag: false,
                contextIsolation: false,
                nodeIntegration: true
            }
        });
        br.on('close', () => app.quit());
        br.removeMenu();
        br.loadFile((require('path').join(__dirname, url)));
        br.show();
    });
};