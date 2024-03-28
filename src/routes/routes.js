require('dotenv').config();
const express = require('express');
const requestIP = require('request-ip');
const geoip = require('geoip-lite');
const bizSdk = require('facebook-nodejs-business-sdk');
const { generateFbc, generateFbp } = require('../util/helpers');

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;

const access_token = process.env.ACCESS_TOKEN;
const pixel_id = process.env.PIXEL_ID;

console.log("AT", access_token, "PI", pixel_id);
const routes = express.Router();


routes.get('/test', (req, res) => {
    return res.status(200).json({ type: 'Test', message: 'Everything works!' });
});

routes.post('/test-event', (req, res) => {
    console.log(req.socket.remoteAddress, req.ip, req.headers['x-forwarded-for'], req.headers['x-real-ip']);
    const ip = requestIP.getClientIp(req);
    console.log(ip);
    const geo = geoip.lookup(ip);

    console.log('Geo: ', geo);
    console.log(req.body);
    res.status(200).json(req.body);
});

routes.post('/', (req, res) => {
    console.log("IPs:", req.socket.remoteAddress, req.ip, req.headers['x-forwarded-for'], req.headers['x-real-ip']);
    console.log('Request Body:', req.body);

    const ip = requestIP.getClientIp(req);
    const geo = geoip.lookup(ip);

    console.log('Geo: ', geo);

    const currentDate = new Date();
    const current_timestamp = Math.floor(currentDate.getTime() / 1000);
    const userData = (new UserData())
        .setClientIpAddress(ip)
        .setClientUserAgent(req.headers['user-agent'])
        .setFbp(req.body.fbp && req.body.fbp.trim() !== "" ? req.body.fbp : generateFbp(currentDate))

    if (geo != null)
        userData.setCity(geo.city.toLowerCase().trim()).setState(geo.region.toLowerCase().trim()).setCountry(geo.country.toLowerCase().trim());

    if (req.body.fbc || req.body.fbclid)
        userData.setFbc(req.body.fbc && req.body.fbc.trim() !== '' ? req.body.fbc : generateFbc(currentDate, req.body.fbclid));

    const customData = new CustomData();
    let serverEvent;

    if (typeof (req.body.event) === 'string')
        serverEvent = new ServerEvent()
            .setEventName(req.body.event)
            .setEventTime(current_timestamp)
            .setUserData(userData)
            .setCustomData(customData)
            .setEventSourceUrl(req.body.event_source_url)
            .setActionSource(req.body.action_source)
            .setEventId(req.body.event + current_timestamp);

    else res.status(500).json({
        message: 'Petición fallida',
        body: 'Event unknown'
    });

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(access_token, pixel_id).setEvents(eventsData);

    const onFullfilled = (response) => {
        console.log('Response: ', response);
        res.status(200).json({
            message: 'Petición recibida',
            body: response ? response : 'respuesta vacia',
            fbr: eventsData
        });
    }

    const onRejected = (err) => {
        console.error('Error: ', err);
        res.status(500).json({
            message: 'Petición fallida',
            body: err ? err : 'Respuesta vacia',
            fbr: eventsData
        });
    }

    eventRequest.execute().then(onFullfilled, onRejected);
});

module.exports = routes;