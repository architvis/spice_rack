
var express = require('express')
var router = express.Router()
var spiceRack = require("./spicerack_configurations/config1");

const NS_PER_SEC = 1e9;
const MUS_PER_SEC = 1e6;
const MS_PER_SEC = 1e3;
const SEC_PER_NS = 1e-9;

var inventory = spiceRack.inventory;

const rState = {
  INACTIVE: "inactive",  // not communicating, can't take request until active
  ACTIVE: "active",        // communicating and taking requests
  ROTATING: "rotating",  // moving spice platform, cannot take certain requests
  AWAITINGINPUT: "awaiting user input"  // when rack needs to wait for user input to say a task is complete, like "User removed and put back the spice" 
}

function getstepsNs(stepsPerSecond){
  return ((1/(stepsPerSecond))*NS_PER_SEC);
}

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

  run() {

  }

  getStepsPerMs(stepsPerSecond) {
    var stepsPerSecond = stepsPerSecond;
    var ms = 1 / (stepsPerSecond * .001);
    return ms;
  }

  setSteps(newRotation) {
    this.rotation = (this.rotation % 360);
    this.idle = false;
    this.state = rState.ROTATING;

    var dist = newRotation - this.rotation;
    if (Math.abs(dist) > 180) {
      dist = (dist > 0) ? dist - 360 : dist + 360;
    }
    this.direction = (dist > 0) ? 1 : -1;
    this.steps = Math.abs(Math.round(dist / this.stepDegrees));
  }

  step() {
    
    
    let startTime = process.hrtime.bigint();
    let time = startTime;
    let stepToggle= 0;
    let nsSpeed = this.stepsPerMs * 1000000;
    this.socket.emit('turnTable_rotation', this.rotation);
    // setTimeout(() =>{ this.step() }, this.stepsPerMs);
    function innerLoop(self) {
      // console.log("innerLoop");
        setImmediate(() => {
          if (self.steps > 0) { // do if steps still exist
            if(stepToggle == 1){ // put to low, fastest way
              stepToggle=0;
              innerLoop(self);
              return;
            }
            let newTime = process.hrtime.bigint();
            let diff = newTime - time;
            if(diff > nsSpeed){ // step if true
              self.steps--;
              time = newTime;
              self.rotation = self.rotation + (self.direction * self.stepDegrees);
              self.socket.emit('turnTable_rotation', self.rotation);
            }
            innerLoop(self);  // innerLoop is always called if more steps exist

          } else {
            
            self.idle = true;
            self.state = rState.ACTIVE;
          }
        });
    }
    innerLoop(this);
    this.socket.emit('turnTable_rotation', this.rotation);
  }

}

function main(io) {
  var table = new TurnTable(spiceRack.rotation, spiceRack.stepDegrees, spiceRack.stepsPerSecond, spiceRack.idle, spiceRack.state, true, io); //rotation = 0, stepDegrees, stepsPerSecond, idle = true, state = "", fullRotation = true
  table.step();

  router.get('/', function (req, res) {
    res.render('web_gl_simulation.pug')
  })

  router.get('/movetopoint/:id', function (req, res) {
    var foundPoint = inventory.find(x => x.uid == req.params.id);
    if (foundPoint != null & table.idle == true) {
      // the following should be inside the turn table class, likely in a beginStep function
      table.setSteps(foundPoint.rotation);
      table.step();
      res.send(200);
    } else {
      res.send(500); // generic server error code
    }
  })

  router.post('/setName', (req, res) => {
    var foundPoint = inventory.find(x => x.uid == req.body.id);
    if (foundPoint != null & table.idle == true) {
      foundPoint.name = req.body.name;
      io.emit('turnTable_inventory', inventory);
      res.send(200);
    } else {
      console.error("Point not found");
      res.send(500); // generic server error code
    }
  })

  router.post('/setContents', (req, res) => {
    var foundPoint = inventory.find(x => x.uid == req.body.id);
    if (foundPoint != null & table.idle == true) {
      foundPoint.contents = req.body.contents;
      io.emit('turnTable_inventory', inventory);
      res.send(200);
    } else {
      console.error("Point not found");
      res.send(500); // generic server error code
    }
  })

  io.on('connection', (socket) => {
    socket.emit('turnTable_inventory', inventory);
    socket.emit('turnTable_rotation', table.rotation);
  });

  return router;
}

module.exports = main