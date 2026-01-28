const cp = require('child_process');
const os = require('os');
module.exports = {
    tgz: {
        unpack: (src, dest) => {
            return new Promise((res, rej) => {
                if(os.platform() === 'linux') {
                    const spawn = cp.spawn('tar', ['-xvzf', src, '-C', dest]);
                    spawn.on('error', e => rej(e));
                    spawn.on('close', code => code == 0 ? res() : rej(new Error(`exited with code ${code}`)));
                } else {
                    rej(new Error("missing backend"));
                }
            });
        }
    },
    szip: require('7zip-min'),
}