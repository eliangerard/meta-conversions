require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');
const https = require('https');
const fs = require('fs');
const app = express();
const path = require('path');

app.use(express.json());
app.use(cors());
app.use(express.static('public'))
app.use('/event', routes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV == "production") {
    const server = https.createServer({
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem'),
    }, app);

    server.listen(PORT, () => {
        console.log(`Server listening on https://localhost:${PORT}`);
    });
}
else app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})