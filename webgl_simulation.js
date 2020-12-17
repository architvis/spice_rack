
var express = require('express')
var router = express.Router()
var spiceRack = require("./spice_rack_config");

var inventory = [{uid: 0, name:"empty", contents: -1, rotation:0 },
  {uid: 1, name:"pepper", contents: 3, rotation:51.42857142857143 },
  {uid: 2, name:"salt", contents: 2, rotation:102.85714285714286 },
  {uid: 3, name:"garlic", contents: 4, rotation:154.28571428571428 },
  {uid: 4, name:"garlic salt", contents: 4, rotation:205.71428571428572 },
  {uid: 5, name:"garlic", contents: 3, rotation:257.14285714285717 },
  {uid: 6, name:"onion", contents: 2,rotation:308.57142857142856 }]

// turn table controller class that  
class TurnTable {
  constructor(rotation = 0, stepDegrees, stepsPerSecond, idle = true, state = "", fullRotation = true, socket) {
    this.rotation = rotation;
    this.stepDegrees = stepDegrees;
    this.stepsPerMs = this.getStepsPerMs(stepsPerSecond);
    this.idle = idle;
    this.fullRotation = fullRotation;
    this.steps = 0;
    this.direction = 0;
    this.state = state;
    this.socket = socket;
  }
  run(){

  }
  getStepsPerMs(stepsPerSecond) {
    var stepsPerSecond = stepsPerSecond;
    var ms = 1 / (stepsPerSecond * .001);
    return ms;
  }
  setSteps(newRotation){
    this.idle = false;
    var dist = newRotation - this.rotation;
    if (Math.abs(dist) > 180) {
      dist = (dist > 0) ? dist - 360 : dist + 360;
    }
    this.direction = (dist > 0) ? 1 : -1;
    this.steps = Math.abs(Math.round(dist / this.stepDegrees));
  }
  step(){
    this.rotation = this.rotation + (this.direction * this.stepDegrees);
    this.steps--;
  
    if (this.steps > 0) {
      console.log(this.rotation);
      this.socket.emit('turnTable_rotation', this.rotation);
      setTimeout(() =>{ this.step() }, this.stepsPerMs);
    } else {
      this.idle = true;
    }
  }

}

function setSteps(newRotation, turnTable) { // function will be part of turnTable class
  turnTable.idle = false;
  var dist = newRotation - turnTable.rotation;
  if (Math.abs(dist) > 180) {
    dist = (dist > 0) ? dist - 180 : dist + 180;
  }
  turnTable.direction = (dist > 0) ? 1 : -1;
  turnTable.steps = Math.abs(Math.round(dist / turnTable.stepDegrees));
}

function getStepsPerMs(stepsPerSecond) {
  var stepsPerSecond = 50;
  var ms = 1 / (stepsPerSecond * .001);
  return ms;
}


function step(turnTable, socket) {  // likely will be part of turnTable
  turnTable.rotation = turnTable.rotation + (turnTable.direction * turnTable.stepDegrees);
  turnTable.steps--;

  if (turnTable.steps > 0) {
    console.log(turnTable.rotation);
    socket.emit('turnTable_rotation', turnTable.rotation);
    setTimeout(function () { step(turnTable, socket) }, turnTable.stepsPerMs);
  } else {
    turnTable.idle = true;
  }
}

function simulateMotor(turnTable, socket) {
  var stepsPerSecond = 50;
  var ms = 1 / (stepsPerSecond * .001);
  turnTable.idle = false; // starting job
  step(turnTable, socket);
}

function main(io) {

  // setSteps(-100, spiceRack);
  // console.log(spiceRack.steps)
  // simulateMotor(spiceRack, io);
  var table = new TurnTable(0, 1.8, 50, true, "", true, io);
  table.setSteps(-100);
  table.step();

  router.get('/', function (req, res) {
    res.render('web_gl_simulation.pug')
  })

  router.get('/movetopoint/:id', function (req, res) {
    console.log("get request to move to id: " + req.params.id);

    var foundPoint = inventory.find(x => x.uid == req.params.id);
    console.log("point found: " + foundPoint.uid);
    if(foundPoint != null){
      table.setSteps(foundPoint.rotation);
      table.step();
  }
    res.send(200)
  })


  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('turnTable_inventory', inventory);
  });

  return router;
}

module.exports = main