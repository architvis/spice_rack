console.log("\n.25:")
checkIntervals(.25, 10, () => {
  console.log("\n.5:")
  checkIntervals(.5, 10, () => {
    console.log("\n1:")
    checkIntervals(1, 10, () => {
      console.log("\n2:")
      checkIntervals(2, 10, () => {
        console.log("\n3:")
        checkIntervals(3, 10, () => {
          console.log("\n4:")
          checkIntervals(4, 10, () => {
            console.log("\n5:")
            checkIntervals(5, 10, () => {
              console.log("\n6:")
              checkIntervals(6, 10, () => {
                console.log("\n7:")
                checkIntervals(7, 10, () => {
                  console.log("\n8:")
                  checkIntervals(8, 10, () => {
                    console.log("\n9:")
                    checkIntervals(9, 10, () => {
                      console.log("\n10:")
                      checkIntervals(10, 10, () => {
                        console.log("\n11:")
                        checkIntervals(11, 10, () => {
                          console.log("\n12:")
                          checkIntervals(12, 10, ()=>{
                            console.log("\n13:")
            checkIntervals(13, 10, ()=>{
              console.log("\n14:")
            checkIntervals(14, 10, ()=>{
              console.log("\n15:")
            checkIntervals(15, 10, ()=>{
              
            })
            })
            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

function checkIntervals(intervalMs, intervals, callback) {
  var iteration = 0;
  console.log("time expected: "+(intervalMs*intervals) + "ms")
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

  function loop() {
    console.time("interval_forLoop");
    for (iteration = 0; iteration < intervals; iteration++) {
      //
    }
    console.timeEnd("interval_forLoop");
    callback(); // call the callback function because this is the last line called
  }
}