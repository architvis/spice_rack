const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'));

var spicerack_simulation = require('./spicerack_simulation');

app.use('/', spicerack_simulation(io)); // passing io to spicerack_simulation

server.listen(port);
