
module.exports = async function (isAdobeFlash, package, updateInfo) {
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    const rmdir = require('./rmdir.js');
    const config = require('./config.js');
    const dir = path.join(__dirname);
    const pkgdir = path.join(dir, 'pkg');
    const fetch = require('./fetch.js');
    const yaml = require('js-yaml');
    const os = require('os');
    const { spawnSync, spawn } = require('child_process');
    const szip = require('7zip-min');
    const asar = require('./asar');
    const isArm = os.arch().includes('arm');
    // start status server
    let status = 'BOOTING_UP';
    const srv = http.createServer(function (req, res) {
        res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*' });
        res.write(status);
        res.end();
    });
    srv.listen(41470);
    // get update info, if necessary
    if(!updateInfo)
        updateInfo = yaml.load(
            await (await fetch(config.UPDATE_ENDPOINT)).text()
        );
    // First, create a temporary folder
    if(fs.existsSync(path.join(pkgdir, 'tmp'))) rmdir(path.join(pkgdir, 'tmp'));
    fs.mkdirSync(path.join(pkgdir, 'tmp'));
    // First, create the main window
    // good UX
    const { BrowserWindow, app } = require('electron');
    app.whenReady().then(() => {
        const br = new BrowserWindow({
            width: 500,
            height: 700,
            webPreferences: {
                sandbox: true,
                plugins: false,
                webviewTag: false,
                contextIsolation: false,
                nodeIntegration: true
            }
        });
        br.on('close', () => {
            rmdir(path.join(pkgdir, 'tmp'));
            app.quit();
            srv.close();
        });
        //br.removeMenu();
        br.loadFile((require('path').join(__dirname, 'splash/update.htm')));
        br.show();
    });
    if(!fs.existsSync(path.join(pkgdir, 'game-version.lock')) || (
        fs.readFileSync(path.join(pkgdir, 'game-version.lock'),{encoding:'utf8'})!=updateInfo.version
    )) {
        status = 'INSTALLING_GAME';
        fs.writeFileSync(
            path.join(pkgdir, 'tmp/appContents.7z'),
            await (
                await fetch(config.UPDATE_BIN_PREFIX + updateInfo.packages.x64.path)
            ).buffer()
        );
        status = 'EXTRACTING_PACKAGE';
        await szip.unpack(path.join(pkgdir, 'tmp/appContents.7z'), path.join(pkgdir, 'tmp/appContents'));
        fs.unlinkSync(path.join(pkgdir, 'tmp/appContents.7z'));
        asar.extractAll(
            path.join(pkgdir, 'tmp/appContents/resources/app.asar'),
            path.join(pkgdir, 'tmp/gameAsar')
        );
        if(isAdobeFlash && os.platform === 'win32') {
            // TODO: Copy pepflashplayer.dll
        }
        rmdir(path.join(pkgdir, 'tmp/appContents'));
        status = 'APPLYING_PATCHES';
        fs.writeFileSync(
            path.join(pkgdir, 'tmp/gameAsar/config.js'),
            fs.readFileSync(
                path.join(pkgdir, 'tmp/gameAsar/config.js'),
                { encoding: 'utf8' }
            ).replaceAll(
                "pepflashplayer.dll",
                os.platform() === 'win32' ? 'pepflashplayer.dll' : 'libpepflashplayer.so'
            ).replaceAll(
                "noUpdater: false,",
                "noUpdater: true,"
            ).replaceAll(
                'pluginPath: "../../",',
                'pluginPath: "../",'
            )
        );
        status = 'REPACKING_GAME';
        await asar.createPackage(
            path.join(pkgdir, 'tmp/gameAsar'),
            path.join(pkgdir, 'game.asar')
        );
        rmdir(path.join(pkgdir, 'tmp/gameAsar'));
    }
    if(isAdobeFlash && os.platform() === 'linux') {
        status = 'DOWNLOADING_PEPPER_FLASH'
        // do stuff for Adobe Flash
        fs.writeFileSync(
            path.join(pkgdir, 'tmp/flashLibs.tar.gz'),
            await (
                await fetch(
                    isArm ? config.FLASH_ARMV7L : config.FLASH_X64
                )
            ).buffer()
        );
        fs.mkdirSync(path.join(pkgdir, 'tmp/flashLibs'));
        status = 'EXTRACTING_PEPPER_FLASH';
        spawnSync('tar', ['-xvzf', path.join(pkgdir, 'tmp/flashLibs.tar.gz'), '-C', path.join(pkgdir, 'tmp/flashLibs')]);
        fs.unlinkSync(path.join(pkgdir, 'tmp/flashLibs.tar.gz'));
        status = 'PATCHING_PEPPER_FLASH';
        if(isArm) {
            fs.copyFileSync(
                path.join(pkgdir, 'tmp/flashLibs/opt/google/chrome/pepper/libpepflashplayer.so'),
                path.join(pkgdir, 'libpepflashplayer.so')
            )
        } else {
            status = ''
            spawnSync('sed', ['-i', 's/\\x00\\x00\\x40\\x46\\x3E\\x6F\\x77\\x42/\\x00\\x00\\x00\\x00\\x00\\x00\\xF8\\x7F/', path.join(pkgdir, 'tmp/flashLibs/libpepflashplayer.so')])
            fs.copyFileSync(
                path.join(pkgdir, 'tmp/flashLibs/libpepflashplayer.so'),
                path.join(pkgdir, 'libpepflashplayer.so')
            )
        }
        rmdir(path.join(pkgdir, 'tmp/flashLibs'));
    }
    status = 'CLEANING_UP';
    const packd = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), { encoding: 'utf8' }));
    packd.version = String(updateInfo.version);
    fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packd, null, 4));
    fs.writeFileSync(path.join(pkgdir, 'game-version.lock'), String(updateInfo.version));
    rmdir(path.join(pkgdir, 'tmp'));
    srv.close();
    app.relaunch();
    app.quit();
}