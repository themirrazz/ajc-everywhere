module.exports = function (url, options = {}) {
    if(!options.width) options.width = 500;
    if(!options.height) options.height = 700;
    const { BrowserWindow, app } = require('electron');
    const close_func = () => app.quit();
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
    br.removeMenu();
    br.loadFile(path.join(__dirname, url));
    br.on('close', close_func);
    return {
        br: {
            close: () => {
                br.off('close', close_func);
                br.close();
            }
        }
    }
};
