let fs = require('original-fs');
const fsutil = require('path');

const fspoly = module.exports = {
    disableAsarWalk: () => { fs = require('original-fs') },
    enableAsarWalk: () => { fs = require('fs') },
    readstr: path => {
        return new Promise((res, rej) => {
            fs.readFile(path, { encoding: 'utf8' }, (err, dat) => {
                if(err) rej(err);
                else res(dat);
            });
        });
    },
    readbin: async path => {
        return new Uint8Array(await fspoly.readbuffer(path));
    },
    readbuffer: path => {
        return new Promise((res, rej) => {
            fs.readFile(path, (err, dat) => {
                if(err) rej(err);
                else res(dat);
            });
        });
    },
    readdir: path => {
        return new Promise((res, rej) => {
            fs.readdir(path, (err, files) => {
                if(err) rej(err);
                else res(files.map(file => fsutil.join(path, file)));
            });
        });
    },
    writestr: (path, data) => {
        return new Promise((res,rej) => {
            fs.writeFile(path, String(data), { encoding: 'utf8' }, err => {
                if(err) rej(err);
                else res();
            });
        });
    },
    writebin: (path, data) => {
        if(data instanceof Uint8Array) data = new Buffer(data);
        return new Promise((res,rej) => {
            fs.writeFile(path, data, (err) => {
                if(err) rej(err);
                else res();
            });
        });
    },
    touch: async (path) => {
        if(await fspoly.exists(path)) {
            if(await fspoly.isDirectory(path))
                throw new TypeError('is a directory');
        } else {
            await fspoly.writestr(path, "");
        }
    },
    mkdir: async (path) => {
        if(await fspoly.exists(path)) {
            if(!(await fspoly.isDirectory(path)))
                throw new TypeError('is not a directory');
        } else {
            return await new Promise((res, rej) => {
                fs.mkdir(path, e => {
                    if(e) rej(e);
                    else res(e);
                })
            });
        }
    },
    cp: (src, dest) => {
        return new Promise((res, rej) => {
            fs.copyFile(src, dest, (err) => {
                if(err) rej(err);
                else res();
            });
        });
    },
    rm: path => {
        return new Promise((res, rej) => {
            fs.unlink(path, (err) => {
                if(err) rej(err);
                else res();
            })
        });
    },
    rmdir: async (path, options={}) => {
        if(options.recursive) {
            // https://stackoverflow.com/a/69556876
            const contents = await fspoly.readdir(path);
            if(contents.length > 0) {
                for (const n_path of contents) {
                    if(!(await fspoly.isFile(n_path)))
                        await fspoly.rmdir(n_path, { recursive: true });
                    else await fspoly.rm(n_path);
                }
            }
            await fspoly.rmdir(path);
        } else {
            return await new Promise((res, rej) => {
                fs.rmdir(path, (e) => {
                    if(e) rej(e);
                    else res();
                });
            });
        }
    },
    exists: path => {
        return new Promise((resolve) => {
            fs.exists(path, exists => resolve(exists));
        });
    },
    isDirectory: path => {
        return new Promise((res,rej) => {
            fs.stat(path, (err,stat) => {
                if(err) rej(err);
                else res(stat.isDirectory())
            });
        });
    },
    isFile: path => {
        return new Promise((res,rej) => {
            fs.stat(path, (err,stat) => {
                if(err) rej(err);
                else res(stat.isFile())
            });
        });
    }
};