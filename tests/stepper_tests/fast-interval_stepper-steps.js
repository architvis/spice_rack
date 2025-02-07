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

let intervals = 0; // for tracking 

direction.writeSync(1);
setupSteppers();

function main(){
  let stepsPerRotation = 3200;
  let stepsPerSecond = 6400;
  immediate(stepsPerRotation, stepsPerSecond);
}

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

function getstepsNs(stepsPerSecond){
  return ((1/(stepsPerSecond))*NS_PER_SEC);
}

function immediate(steps, stepsPerSecond) {
  var iteration = 0;
  let startTime = process.hrtime.bigint();
  let time = startTime;
  let intervalNs = getstepsNs(stepsPerSecond);  
  let startNsSpeed = intervalNs; //startSpeed
  let nsSpeed = startNsSpeed;
  function innerLoop() {
    setImmediate(() => {
      intervals++;
      if (iteration < (steps)) {

        if(stepToggle == 1){ // put to low, fastest way
          stepToggle=0;
          step.writeSync(stepToggle);  // put to low
          innerLoop();
          return;
        }

        let newTime = process.hrtime.bigint();
        let diff = newTime - time;

        if (diff > nsSpeed) { // min time
          iteration++;
          stepToggle = ((stepToggle == 0) ? 1 : 0);
          step.writeSync(stepToggle);
          time = newTime;
        }
        innerLoop();
      } else {
        let oldTime = startTime;
        time = process.hrtime.bigint();
        let diff = time - oldTime;
        console.log("Time to complete movement: " + (parseInt(diff)*SEC_PER_NS)+ "s");
        console.log("intervals: "+intervals);
      }
    });
  }
  innerLoop();
}

main();