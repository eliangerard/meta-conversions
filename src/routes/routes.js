const express = require('express');
const { detailIP } = require('../middlewares/ip');
const { fireEvent } = require('../controllers/event');
const routes = express.Router();


routes.get('/test', (req, res) => {
    return res.status(200).json({ type: 'Test', message: 'Everything works!' });
});

routes.get('/redirect', detailIP, async (req, res) => {
    const url = req.query.url;
    const name = req.query.name;
    console.log(req.headers);
    if (url) {
        const response = await fireEvent(req, { event: name, event_source_url: url });
        console.log(response);
        return res.redirect(url);
    } else {
        return res.status(400).json({ error: 'Missing url parameter' });
    }
});

routes.post('/', detailIP, async (req, res) => {
    const response = await fireEvent(req, req.body);
    console.log(response);
    return res.status(response.code).json(response);
});

module.exports = routes;