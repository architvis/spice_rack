const NS_PER_SEC = 1e9;

console.log("Testing execution time.");

{
  let time = process.hrtime.bigint();
  let oldTime = time;
  time = process.hrtime.bigint();
  let diff = time-oldTime;
  console.log("ns: " + diff);
  console.log(""+((parseFloat(diff)/1000000)) + "ms")
}
 
function immediate() {
  var iteration = 0;
  let intervals = 1000000; 
  let time = process.hrtime.bigint();
  function innerLoop() {
    setImmediate(() => {
      if ((iteration++) < intervals) {
        innerLoop();
      } else {

      }
    });
  }
  innerLoop();
  let oldTime = time;
  time = process.hrtime.bigint();
  let diff = time-oldTime;
  console.log("**Immediate "+ intervals +" intervals**\nns: " + parseFloat(diff));
  console.log("ms: "+((parseFloat(diff)/1000000)))
  console.log("average ns: " + (parseFloat(diff))/intervals);
  console.log("average ms: "+((parseFloat(diff)/1000000)/intervals))
}

immediate();