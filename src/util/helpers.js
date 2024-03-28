const generateFbp = (creationTime) => {
    let random = Math.random().toString().replace('.', '');
    return `fb.1.${creationTime.getTime()}.${random}`;
}

const generateFbc = (creationTime, fbclid) => {
    return `fb.1.${creationTime.getTime()}.${fbclid}`;
}

module.exports = {
    generateFbp,
    generateFbc,
}