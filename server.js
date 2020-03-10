//Server configuration file
const express = require('express');
const connectDB= require('./config/db');

const app = express();

//connect database
connectDB();

//Init Middleware
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API Running'));

//Define routes
app.use('/api/users'  , require('./routes/api/users'));
app.use('/api/auth'   , require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post'   , require('./routes/api/post'));

const PORT = process.env.PORT || 5000; //First checks for environment variable defined to run server on (LIKE HEROKU)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));