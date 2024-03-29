const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');
const https = require('https');
const app = express();

app.use(express.json());
app.use(cors());

const ssl = {
    key: fs.readFileSync('clave-privada.pem'),
    cert: fs.readFileSync('certificado.pem'),
};

const server = https.createServer(ssl, app);


app.use(express.static(path.join(__dirname, 'dist')));
app.use('/event', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
// server.listen(PORT, () => {
//     console.log(`Servidor escuchando en https://localhost:${port}`);
// });