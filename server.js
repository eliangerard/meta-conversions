const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');
const https = require('https');
const fs = require('fs');
const app = express();
const path = require('path');

app.use(express.json());
app.use(cors());

const ssl = {
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem'),
};

const server = https.createServer(ssl, app);

app.use(express.static('public'))
app.use('/event', routes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor escuchando en https://localhost:${port}`);
});