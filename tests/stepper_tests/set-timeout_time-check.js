

checkIntervals(0,1000)
function checkIntervals(intervalMs, intervals) {
  var iteration = 0;
  console.log("Test Started \n");

  console.time("interval_setTimeOut");
  function test() {
    setTimeout(() => {
      if ((iteration++) < intervals) {
        // console.log(iteration)
        test();
      } else {
        console.timeEnd("interval_setTimeOut");
        move();
      }
    }, intervalMs);
  }
  test();

  function move() {
    iteration = 0;
    console.time("interval_setInterval");
    var id = setInterval(frame, intervalMs);
    function frame() {

      if (iteration++ < intervals) {
        
      } else {
        console.timeEnd("interval_setInterval");
        clearInterval(id);
        loop();
      }
    }
  }

  function loop(){
  console.time("interval_forLoop");
  for(iteration=0; iteration<intervals; iteration++){
    //
  }
  console.timeEnd("interval_forLoop");
  } 

}