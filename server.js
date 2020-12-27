const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'));

var webgl_simulation = require('./webgl_simulation');

app.use('/', webgl_simulation(io)); // passing io to webgl_simulation

server.listen(port);
