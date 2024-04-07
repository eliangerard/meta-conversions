const requestIP = require('request-ip');
const geoip = require('geoip-lite');

const detailIP = (req, res, next) => {
    const ip = requestIP.getClientIp(req);
    const geo = geoip.lookup(ip);

    req.data = { ip, geo };
    next();
}

module.exports = { detailIP };