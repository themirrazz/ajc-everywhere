module.exports = function (v1, v2) {
    // consts
    const STAGE_HIEARCHY = ['alpha', 'beta', 'prod'];
    // v1
    const v1mj = Number(v1.split('-')[0].split('.')[0]);
    const v1mn = Number(v1.split('-')[0].split('.')[1]);
    const v1pt = Number(v1.split('-')[0].split('.')[2]);
    const v1s = v1.split('-')[1] || 'prod';
    // v2
    const v2mj = Number(v2.split('-')[0].split('.')[0]);
    const v2mn = Number(v2.split('-')[0].split('.')[1]);
    const v2pt = Number(v2.split('-')[0].split('.')[2]);
    const v2s = v2.split('-')[1] || 'prod';
    // compare
    if(v2mj > v1mj) return true;
    if(v2mj === v1mj && v2mn > v1mn) return true;
    if(v2mj === v1mj && v2mn === v1mn && v2pt > v1pt) return true;
    if(v2mj == v1mj && v2mn == v1mn && v2pt == v1pt && (
        STAGE_HIEARCHY.indexOf(v2s) > STAGE_HIEARCHY.indexOf(v1s)
    )) return true;
    // the end
    return false;
};