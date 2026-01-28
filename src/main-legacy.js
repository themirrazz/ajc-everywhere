const fs = require('fs');
const path = require('path');

const config = require('./config.js');
const os = require('os');
const dir = path.join(__dirname);
const pkgdir = path.join(dir, 'pkg');
if(!fs.existsSync(pkgdir)) fs.mkdirSync(pkgdir, { recursive: true });
const fetch = require('./fetch.js');
const yaml = require('js-yaml');
const { spawnSync } = require('child_process');

const { app } = require('electron');

if(fs.existsSync(path.join(__dirname, 'update.tar.gz'))) {
    spawnSync('tar', ['-xvzf', path.join(__dirname, 'update.tar.gz'), '-C', path.join(__dirname, '../../')]);
    fs.unlinkSync(path.join(__dirname, 'update.tar.gz'));
    app.relaunch();
    app.quit();
} else require('./selfUpdater.js');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch("ppapi-flash-path", path.join(pkgdir, 
    os.platform() === 'win32' ? 'pepflashplayer.dll' : 'libpepflashplayer.so'
));

const PACKAGE = config.PACKAGE_NAME[os.platform().toUpperCase()];
const ASAR_EXISTS = fs.existsSync(path.join(pkgdir, 'game.asar'));
const LIBPEPPERFLASH_EXISTS = fs.existsSync(path.join(pkgdir, PACKAGE));
const LOCK_EXSISTS = fs.existsSync(path.join(pkgdir, 'game-version.lock'))

if(!PACKAGE) require('./mono.js')('splash/incompatible.htm');
else if(!LIBPEPPERFLASH_EXISTS) require('./updater.js')(true, PACKAGE)
else {
    if(!(ASAR_EXISTS&&LOCK_EXSISTS))
        require('./updater.js')(os.platform() === 'win32', PACKAGE);
    else fetch(config.UPDATE_ENDPOINT).then(r => r.text()).then(data_raw => {
        const upd_data = yaml.load(data_raw);
        if(upd_data.version !== fs.readFileSync(path.join(pkgdir, 'game-version.lock'), {
            encoding: 'utf-8'
        })) {
            require('./updater.js')(false, PACKAGE, upd_data);
        } else {
            require('./gameLoader.js')();
        }
    });
}