const { ServerEvent, EventRequest, UserData, CustomData } = require('facebook-nodejs-business-sdk');
const { generateFbc, generateFbp } = require('../util/helpers');
const { ACCESS_TOKEN, PIXEL_ID } = process.env;

const fireEvent = async (req, data) => {
    const ip = req.data.ip;
    const geo = req.data.geo;

    console.log(`\n----${new Date()} Firing event from IP: ${ip}----`);
    console.log("Geo", geo);
    console.log("Request body", data);

    const currentDate = new Date();
    const current_timestamp = Math.floor(currentDate.getTime() / 1000);
    const userData = (new UserData())
        .setClientIpAddress(ip)
        .setClientUserAgent(req.headers['user-agent'])
        .setFbp(data.fbp && data.fbp.trim() !== "" ? data.fbp : generateFbp(currentDate))

    if (geo != null)
        userData.setCity(geo.city.toLowerCase().trim()).setState(geo.region.toLowerCase().trim()).setCountry(geo.country.toLowerCase().trim());

    if (data.fbc || data.fbclid)
        userData.setFbc(data.fbc && data.fbc.trim() !== '' ? data.fbc : generateFbc(currentDate, data.fbclid));

    const customData = new CustomData();
    let serverEvent;

    if (typeof (data.event) === 'string')
        serverEvent = new ServerEvent()
            .setEventName(data.event)
            .setEventTime(current_timestamp)
            .setUserData(userData)
            .setCustomData(customData)
            .setEventSourceUrl(data.event_source_url)
            .setActionSource("website")
            .setEventId(data.event + current_timestamp);

    else return {
        code: 500,
        message: 'Petición fallida',
        body: 'Event unknown'
    };

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID).setEvents(eventsData);

    const onFullfilled = (response) => ({
        message: 'Petición recibida',
        code: 200,
        body: response ? response : 'respuesta vacia',
        fbr: eventsData
    })


    const onRejected = (err) => ({
        message: 'Petición fallida',
        code: 500,
        body: err ? err : 'Respuesta vacia',
        fbr: eventsData
    })

    return eventRequest.execute().then(onFullfilled, onRejected);
}

module.exports = { fireEvent };