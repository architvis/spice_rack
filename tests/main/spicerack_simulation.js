
var express = require('express')
var router = express.Router()
var spiceRack = require("./config1");

var inventory = spiceRack.inventory;

const NS_PER_SEC = 1e9;
const MUS_PER_SEC = 1e6;
const MS_PER_SEC = 1e3;
const SEC_PER_NS = 1e-9;

var spiceRack = require("./config1");

const Gpio = require('onoff').Gpio;
const step = new Gpio(spiceRack.step_pin, 'out');       // GPIO17 as an output
const direction = new Gpio(spiceRack.dir_pin, 'out');       // GPIO18 as an output
const stepsMs = spiceRack.stepsPerMs;

let ms1;       // GPIO17 as an output
let ms2;       // GPIO18 as an output
let ms3;       // GPIO18 as an output

let stepToggle = 0;
let steps = 0;
let maxSteps = 200 * 16;
direction.writeSync(1);
setupSteppers();


function setupSteppers() {
  if (spiceRack.microsteppingMode > 0) {
    console.log("Microstepping enabled")
    if (spiceRack.ms1_pin == null | spiceRack.ms1_pin == null | spiceRack.ms1_pin == null) {
      console.error("Microstepping is enabled but all microstepping pins are not set!");
    }

    ms1 = new Gpio(spiceRack.ms1_pin, 'out');       // GPIO17 as an output
    ms2 = new Gpio(spiceRack.ms2_pin, 'out');       // GPIO18 as an output
    ms3 = new Gpio(spiceRack.ms3_pin, 'out');       // GPIO18 as an output

    let mode = spiceRack.microsteppingMode;
    ms1.writeSync((mode == 1 | mode == 3 | mode == 4) ? 1 : 0); //sets pin high if mode is set to 1, 3 or 4 
    ms2.writeSync((mode == 2 | mode == 3 | mode == 4) ? 1 : 0); //sets pin high if mode is set to 2, 3 or 4 
    ms3.writeSync(mode == 4 ? 1 : 0); //sets pin high if mode is set to 4 
    console.log(((mode == 1 | mode == 3 | mode == 4) ? 1 : 0) + " " + ((mode == 2 | mode == 3 | mode == 4) ? 1 : 0) + " " + (mode == 4 ? 1 : 0));
  } else if ((spiceRack.microsteppingMode == 0) & spiceRack.ms1_pin & spiceRack.ms1_pin & spiceRack.ms1_pin) { // full step mode and microstepping pins are set
    console.log("Microstepping disabled" + ", mode: " + spiceRack.microsteppingMode)
    ms1 = new Gpio(spiceRack.ms1_pin, 'out');       // GPIO17 as an output
    ms2 = new Gpio(spiceRack.ms2_pin, 'out');       // GPIO18 as an output
    ms3 = new Gpio(spiceRack.ms3_pin, 'out');       // GPIO18 as an output

    // set microstepping pins to fullstep mode
    ms1.writeSync(0);
    ms2.writeSync(0);
    ms3.writeSync(0);
  } else {
    console.error("Microstepping pins are not set and are required, please check that ms1_pin, ms2_pin, ms3_pin are set.");
  }
}




const rState = {
  INACTIVE: "inactive",  // not communicating, can't take request until active
  ACTIVE: "active",        // communicating and taking requests
  ROTATING: "rotating",  // moving spice platform, cannot take certain requests
  AWAITINGINPUT: "awaiting user input"  // when rack needs to wait for user input to say a task is complete, like "User removed and put back the spice" 
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

  run(){

  }

  getStepsPerMs(stepsPerSecond) {
    var stepsPerSecond = stepsPerSecond;
    var ms = 1 / (stepsPerSecond * .001);
    return ms;
  }

  setSteps(newRotation){
    this.rotation = (this.rotation%360);
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
    
    stepToggle = ((stepToggle == 0) ? 1 : 0);
    step.writeSync(stepToggle);
    console.log("stepper steped");
  
    if (this.steps > 0) {
      this.socket.emit('turnTable_rotation', this.rotation);
      setTimeout(() =>{ this.step() }, this.stepsPerMs);
    } else {
      this.idle = true;
      this.state = rState.ACTIVE;
    }
  }

}

function main(io) {
  console.log("test")
  setupSteppers();
  var table = new TurnTable(spiceRack.rotation, spiceRack.stepDegrees, spiceRack.stepsPerSecond, spiceRack.idle, spiceRack.state, true, io); //rotation = 0, stepDegrees, stepsPerSecond, idle = true, state = "", fullRotation = true
  table.step();

  router.get('/', function (req, res) {
    res.render('web_gl_simulation.pug')
  })

  router.get('/movetopoint/:id', function (req, res) {
    var foundPoint = inventory.find(x => x.uid == req.params.id);
    if(foundPoint != null & table.idle == true){
      // the following should be inside the turn table class, likely in a beginStep function
      table.setSteps(foundPoint.rotation);
      table.step();
      res.send(200);
    }else{
      res.send(500); // generic server error code
    }
  })

  router.post('/setName', (req, res) =>{
    var foundPoint = inventory.find(x => x.uid == req.body.id);
    if(foundPoint != null & table.idle == true){
      foundPoint.name = req.body.name; 
      io.emit('turnTable_inventory', inventory);
      res.send(200);
    }else{
      console.error("Point not found");
      res.send(500); // generic server error code
    }
  })

  router.post('/setContents', (req, res) =>{
    var foundPoint = inventory.find(x => x.uid == req.body.id);
    if(foundPoint != null & table.idle == true){
      foundPoint.contents = req.body.contents; 
      io.emit('turnTable_inventory', inventory);
      res.send(200);
    }else{
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