const fetch = require('./fetch.js');
const os = require('os');
const fs = require('./fspoly.js');
const path = require('path');
const ark = require('./ark.js');
const vcomp = require('./vcomp.js');

const APP_VERSION = '0.1.0-alpha';
const UPDATE_CHANNEL = 'stable';

const UPDATE_URL = `https://packages.themirrazz.vercel.app/updates/ajc-everywhere/${UPDATE_CHANNEL}.json`;

module.exports = async function selfUpdater(forced) {
    const updateInfo = await (await fetch(UPDATE_URL)).json();
    if(vcomp(APP_VERSION, updateInfo.version) || forced) {
        if(os.platform() === 'linux') {
            const AArch = os.arch().includes('arm') ? 'armv7' : 'x64';
            await fs.writebin(
                path.join(__dirname, 'update.tar.gz'),
                await (
                    await fetch(
                        updateInfo.download[os.platform() + '-' + AArch]
                    )
                ).buffer()
            );
            await ark.tgz.unpack(path.join(__dirname, 'update.tar.gz'), path.join(__dirname, '../../'));
            await fs.rm(path.join(__dirname, 'update.tar.gz'));
        } else if(os.platform() === 'win32') {
            // TODO: Update the app
        } else if(os.platform() === 'darwin') {
            // TODO: Update the app
        }
    }
};