const Gpio = require('onoff').Gpio; 
const step = new Gpio(17, 'out');       // GPIO17 as an output
const direction = new Gpio(18, 'out');       // GPIO18 as an output

let stepToggle = 0;
let steps = 0;
let maxSteps = 1125*2*100;
let stepsMs = 1;
direction.writeSync(1);

console.time("fullrotation");
var stepInterval = setInterval(runStep, stepsMs); //run the stepInterval function every 50ms

function runStep() { //function to start blinking

  stepToggle=((stepToggle==0) ? 1 : 0);
  step.writeSync(stepToggle); 
  // stepToggle=((stepToggle==0) ? 1 : 0);
  // step.writeSync(stepToggle); 

  steps++;
  if(steps > maxSteps){
    endStep();
  }
}

function endStep() { //function to stop blinking
  console.timeEnd("fullrotation");

  console.log("endStep()");

  clearInterval(stepInterval); // Stop stepInterval
  step.writeSync(0);  // turn off before freeing resource
  step.unexport(); // Unexport GPIO to free resources
  direction.writeSync(0); // turn off before freeing resource
  direction.unexport(); // Unexport GPIO to free resources
}

