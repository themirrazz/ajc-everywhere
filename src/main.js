// Load the required libraries
const fs = require('./fspoly.js');
const path = require('path');
const selfUpdate = require('./selfUpdater.js');
const gameUpdate = require('./gameUpdater.js');
const os = require('os');
const fetch = require('./fetch.js');
// Load the configuration files
const { pkgdir } = require('./dirs.js');
const config = require('./config.js');
const libswf_package = config.PACKAGE_NAME[os.platform().toUpperCase()];

const { app, session } = require('electron');

// Pepper Flash doesn't work properly on Linux
// if the sandbox is enabled; the reason is unknown
if(os.platform() === 'linux')
    app.commandLine.appendSwitch('no-sandbox');

// Preload Flash; whatever `game.asar` loads no longer matters
if(libswf_package)
    app.commandLine.appendSwitch("ppapi-flash-path", path.join(pkgdir, libswf_package));

// Main function
(async () => {
    await app.whenReady();
    // The user's OS is not supported
    if(!libswf_package)
        return require('./mono.js')('splash/incompatible.htm');
    // Make the `pkg` directory if it doesn't exist
    if(!await fs.exists(pkgdir))
        await fs.mkdir(pkgdir);
    // Check to see if important files exist
    const gameLock = await fs.exists(path.join(pkgdir, 'game-version.lock'));
    const gameAsar = await fs.exists(path.join(pkgdir, 'game.asar'));
    // Get current game version
    const gameVersion = gameLock ? await fs.readstr(path.join(pkgdir, 'game-version.lock')) : '0.0.0-prod';
    // Get the latest game version
    const yaml = require('js-yaml');
    const upd_data_t = await (await fetch(config.UPDATE_ENDPOINT)).text();
    const upd_data = yaml.load(upd_data_t);
    let popup;
    if(!(gameLock&&gameAsar))
        popup = require('./mono.js')('splash/update.htm'),
        await gameUpdate(upd_data.version, upd_data.packages.x64.path);
    else {
        // the game exists, so now we actually load the libraries we need
        // this prevents early crashing, which can be an issue sometimes
        // Check to see if there's a new update or something
        if((require('./vcomp.js'))(gameVersion, upd_data.version)) {
            popup = require('./mono.js')('splash/update.htm');
            await gameUpdate(upd_data.version, upd_data.packages.x64.path);
        }
    }
    // Now we need to check if Flash is installed
    const ppapiExists = await fs.exists(path.join(pkgdir, libswf_package));
    if(!ppapiExists) {
        if(!popup) popup = require('./mono.js')('splash/update.htm');
        // Return bc this requires a full app restart
        return await gameUpdate.flashUpdate();
    }
    if(popup) popup.br.close();
    // Spoof the version in the user agent
    session.defaultSession.setUserAgent(
        session.defaultSession.getUserAgent().replace(
            `AJClassic/${require('./package.json').version}`,
            `AJClassic/${gameVersion}`
        )
    );
    // AJ Classic's built-in updater stops the game from signing in on Linux
    const gameConfig = require('./pkg/game.asar/config.js');
    Object.defineProperty(gameConfig, 'noUpdater', {
        value: true,
        writable: true
    });
    setTimeout(() => selfUpdate(), 1000);
    require('./pkg/game.asar/index.js');
})();