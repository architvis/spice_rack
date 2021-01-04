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
  console.log("Microstepping disabled" + ", mode: "+spiceRack.microsteppingMode)
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

console.time("fullrotation");
var stepInterval = setInterval(runStep, stepsMs); //run the stepInterval function every 50ms

function runStep() { //function to start blinking

  stepToggle = ((stepToggle == 0) ? 1 : 0);
  step.writeSync(stepToggle);

  steps++;
  if (steps > (maxSteps * 2)) {
    endStep();
  }
}

function endStep() { //function to stop blinking
  console.timeEnd("fullrotation");
  clearInterval(stepInterval); // Stop stepInterval
  step.writeSync(0);  // turn off before freeing resource
  step.unexport(); // Unexport GPIO to free resources
  direction.writeSync(0); // turn off before freeing resource
  direction.unexport(); // Unexport GPIO to free resources
}

