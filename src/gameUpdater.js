const fs = require('./fspoly.js');
const path = require('path');
const{ pkgdir } = require('./dirs.js');
const fetch = require('./fetch.js');
const config = require('./config.js');
const ark = require('./ark.js');
const os = require('os');
const isArm = os.arch().includes('arm');
const { spawnSync } = require('child_process');

const gameUpdate = module.exports = async function (version, path_u) {
    await fs.writebin(
        path.join(pkgdir, 'tmp-game-libs.7z'),
        await (await fetch(config.UPDATE_BIN_PREFIX + path_u)).buffer()
    );
    await ark.szip.unpack(
        path.join(pkgdir, 'tmp-game-libs.7z'),
        path.join(pkgdir, 'tmp-game-libs')
    );
    await fs.cp(
        path.join(pkgdir, 'tmp-game-libs/resources/app.asar'),
        path.join(pkgdir, 'game.asar')
    );
    // Clean-up
    await fs.rm(path.join(pkgdir, 'tmp-game-libs.7z'));
    await fs.rmdir(path.join(pkgdir, 'tmp-game-libs'), { recursive: true });
    await fs.writestr(
        path.join(pkgdir, 'game-version.lock'),
        String(version)
    );
};

gameUpdate.flashUpdate = async function () {
    if(os.platform() === 'linux') {
        await fs.writebin(
            path.join(pkgdir, 'tmp-flash-libs.tar.gz'),
            await (await fetch(isArm ? config.FLASH_ARMV7L : config.FLASH_X64)).buffer()
        );
        // if I don't do this, tar will crash
        if(!await fs.exists(path.join(pkgdir, 'tmp-flash-libs')))
            await fs.mkdir(path.join(pkgdir, 'tmp-flash-libs'));
        // extracat the image here
        await ark.tgz.unpack(
            path.join(pkgdir, 'tmp-flash-libs.tar.gz'),
            path.join(pkgdir, 'tmp-flash-libs')
        );
        if(isArm) {
            await fs.cp(
                path.join(pkgdir, 'tmp-flash-libs/opt/google/chrome/pepper/libpepflashplayer.so'),
                path.join(pkgdir, 'libpepflashplayer.so')
            );
        } else {
            spawnSync('sed', ['-i', 's/\\x00\\x00\\x40\\x46\\x3E\\x6F\\x77\\x42/\\x00\\x00\\x00\\x00\\x00\\x00\\xF8\\x7F/', path.join(pkgdir, 'tmp-flash-libs/libpepflashplayer.so')]);
            await fs.cp(
                path.join(pkgdir, 'tmp-flash-libs/libpepflashplayer.so'),
                path.join(pkgdir, 'libpepflashplayer.so')
            );
        }
        await fs.rm(path.join(pkgdir, 'tmp-flash-libs.tar.gz'));
        await fs.rmdir(path.join(pkgdir, 'tmp-flash-libs'), { recursive: true });
    }
    const e = require('electron');
    e.app.relaunch();
    e.app.quit();
};