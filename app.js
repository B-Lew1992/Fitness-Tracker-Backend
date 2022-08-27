require("dotenv").config()
const express = require("express")
const app = express()

const apiRouter = require('./api');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.json());
// Setup your Middleware and API Router here

app.use((req, res, next) => {
	console.log('<____Body Logger START____>');
	console.log(req.body);
	console.log('<_____Body Logger END_____>');
    next();
});

app.get('/', (req, res) => {
	res.send(`
    <h1>Welcome to the Homepage!</h1>
    <div>
    <p>Use this API to help you create a wonderful Fitness Tracker Website!</p>
    </div>
    `);
});

app.use('/api', apiRouter);
module.exports = app;
