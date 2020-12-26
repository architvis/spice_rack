
var express = require('express')
var router = express.Router()
var spiceRack = require("./spice_rack_config");

var inventory = spiceRack.inventory;

const rState = {
  INACTIVE: "inactive",  // not communicating, can't take request until active
  ACTIVE: "active",        // communicating and taking requests
  ROTATING: "rotating",  // moving spice platform, cannot take certain requests
  AWAITINGINPUT: "awaiting user input"  // when rack needs to wait for user input to say a task is complete, like "User removed and put back the spice" 
} 


// turn table controller class that  
class TurnTable {
  constructor(rotation = 0, stepDegrees, stepsPerSecond, idle = true, state = rState.ACTIVE, fullRotation = true, socket) {
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
    this.state = rState.ROTATING; 

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
      this.socket.emit('turnTable_rotation', this.rotation);
      setTimeout(() =>{ this.step() }, this.stepsPerMs);
    } else {
      this.idle = true;
      this.state = rState.ACTIVE;
      console.log("complete: using ms=> "+ this.stepsPerMs)
    }
  }

}

function main(io) {

  // setSteps(-100, spiceRack);
  // console.log(spiceRack.steps)
  // simulateMotor(spiceRack, io);
  var table = new TurnTable(spiceRack.rotation, spiceRack.stepDegrees, spiceRack.stepsPerSecond, spiceRack.idle, spiceRack.state, true, io); //rotation = 0, stepDegrees, stepsPerSecond, idle = true, state = "", fullRotation = true
  table.step();

  router.get('/', function (req, res) {
    res.render('web_gl_simulation.pug')
  })

  router.get('/movetopoint/:id', function (req, res) {
    console.log("Get request to move to id: " + req.params.id);
    var foundPoint = inventory.find(x => x.uid == req.params.id);
    if(foundPoint != null & table.idle == true){
      console.log("point found: " + foundPoint.uid);
      // the following should be inside the turn table class, likely in a beginStep function
      table.setSteps(foundPoint.rotation);
      table.step();
      res.send(200);
    }else{
      console.log("error in movetopoint, table may be idle or point not found.");
      res.send(500); // generic server error code
    }
  })


  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('turnTable_inventory', inventory);
  });

  return router;
}

module.exports = main