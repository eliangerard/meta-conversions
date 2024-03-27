const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/event', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));