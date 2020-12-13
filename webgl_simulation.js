
var express = require('express')
var router = express.Router()
var spiceRack = require("./spice_rack_config");

function setSteps(newRotation, turnTable) { // function will be part of turnTable class
  turnTable.idle = false;
  var dist = newRotation - turnTable.rotation;
  if (Math.abs(dist) > 180) {
    dist = (distClockwise > 0) ? dist - 360 : dist + 360;
  }
  turnTable.direction = (dist>0)? 1:-1;
  turnTable.steps = Math.abs(Math.round(dist / turnTable.stepDegrees));
}

function getStepsPerMs(stepsPerSecond) {
  var stepsPerSecond = 50;
  var ms = 1 / (stepsPerSecond * .001);
  return ms;
}


function step(turnTable) {  // likely will be part of turnTable
  turnTable.rotation = turnTable.rotation + (turnTable.direction * turnTable.stepDegrees);
  turnTable.steps--;

  if (turnTable.steps > 0) {
    console.log(turnTable.rotation);
    setTimeout(function () { step(turnTable) }, turnTable.stepsPerMs);
  } else {
    turnTable.idle = true;
  }
}

function simulateMotor(turnTable) {
  var stepsPerSecond = 50;
  var ms = 1 / (stepsPerSecond * .001);
  turnTable.idle = false; // starting job
  step(turnTable);
}

function main(io) {

  setSteps(-100, spiceRack);
  console.log(spiceRack.steps)
  simulateMotor(spiceRack);

  router.get('/', function (req, res) {
    res.render('web_gl_simulation.pug')
  })

  io.on('connection', (socket) => {
    console.log('a user connected');
  });

  return router;
}

module.exports = main