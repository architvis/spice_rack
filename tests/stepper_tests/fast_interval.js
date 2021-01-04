const NS_PER_SEC = 1e9;

// console.log("Testing execution time.");

// {
//   let time = process.hrtime.bigint();
//   let oldTime = time;
//   time = process.hrtime.bigint();
//   let diff = time-oldTime;
//   console.log("Fastest instruction speed");
//   console.log("ns: " + diff);
//   console.log(""+((parseFloat(diff)/1000000)) + "ms")
// }
 
function immediate() {
  var iteration = 0;
  let intervals = 64000; 
  let startTime = process.hrtime.bigint();
  let time = startTime;
  let intervalNs = 50000;
  function innerLoop() {
    setImmediate(() => {
      if (iteration < intervals) {
        let newTime = process.hrtime.bigint();
        let diff = newTime-time;
        if(diff>intervalNs){
          iteration++;
          time = newTime;
        }
        innerLoop();
      } else {
        let oldTime = startTime;
        time = process.hrtime.bigint();
        let diff = time-oldTime;
        console.log("**Immediate "+ intervals +" intervals**\nns: " + diff);
        console.log("ms: "+((parseFloat(diff)/1000000)))
        console.log("average ns: " + (parseFloat(diff))/intervals);
        console.log("average ms: "+((parseFloat(diff)/1000000)/intervals))
      }
    });
  }
  innerLoop();
}

immediate();