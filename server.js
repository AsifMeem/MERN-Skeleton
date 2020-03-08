//Server configuration file
const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000; //First checks for environment variable defined to run server on (LIKE HEROKU)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));