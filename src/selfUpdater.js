const fetch = require('./fetch.js');
const os = require('os');
const fs = require('fs');
const VERSION_MAJOR = 0;
const VERSION_MINOR = 0;
const VERSION_PATCH = 2;
const VERSION_STAGE = 'alpha';
const UPDATE_CHANNEL = 'stable';
const UPDATE_URL = `https://packages.themirrazz.vercel.app/updates/ajc-everywhere/${UPDATE_CHANNEL}.json`;
const STAGE_HIEARCHY = ['alpha', 'beta', 'prod']
(async function () {
    const updateInfo = await (await fetch(UPDATE_CHANNEL)).json();
    const stage = updateInfo.version.split('-')[1] || 'prod';
    const versionData = updateInfo.version.split('-')[0];
    const major = Number(versionData.split('.')[0]);
    const minor = Number(versionData.split('.')[1]);
    const patch = Number(versionData.split('.')[2]);
    let isOutdated = major > VERSION_MAJOR || (major === VERSION_MAJOR && (minor > VERSION_MINOR || (minor === VERSION_MINOR && (
        patch > VERSION_PATCH || (
            patch === VERSION_PATCH && (
                STAGE_HIEARCHY.indexOf(stage) > STAGE_HIEARCHY.indexOf(VERSION_STAGE)
            )
        )
    ))));
    if(isOutdated) {
        const AArch = os.arch().includes('arm') ? 'armv7' : 'x64';
        fs.writeFileSync(
            path.join(__dirname, 'update.tar.gz'),
            await (
                await fetch(
                    updateInfo.download[os.platform() + '-' + AArch]
                )
            ).buffer()
        );
    }
})();