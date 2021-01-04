let intervals = 100;
console.log("\n.01:")
checkIntervals(.01, intervals, () => {
  console.log("\n.1:")
  checkIntervals(.1, intervals, () => {
    console.log("\n.25:")
    checkIntervals(.25, intervals, () => {
      console.log("\n.5:")
      checkIntervals(.5, intervals, () => {
        console.log("\n1:")
        checkIntervals(1, intervals, () => {
          console.log("\n2:")
        //   checkIntervals(2, intervals, () => {
        //     console.log("\n3:")
        //     checkIntervals(3, intervals, () => {
        //       console.log("\n4:")
        //       checkIntervals(4, intervals, () => {
        //         console.log("\n5:")
        //         checkIntervals(5, intervals, () => {
        //           console.log("\n6:")
        //           checkIntervals(6, intervals, () => {
        //             console.log("\n7:")
        //             checkIntervals(7, intervals, () => {
        //               console.log("\n8:")
        //               checkIntervals(8, intervals, () => {
        //                 console.log("\n9:")
        //                 checkIntervals(9, intervals, () => {
        //                   console.log("\n10:")
        //                   checkIntervals(10, intervals, () => {
        //                     console.log("\n11:")
        //                     checkIntervals(11, intervals, () => {
        //                       console.log("\n12:")
        //                       checkIntervals(12, intervals, () => {
        //                         console.log("\n13:")
        //                         checkIntervals(13, intervals, () => {
        //                           console.log("\n14:")
        //                           checkIntervals(14, intervals, () => {
        //                             console.log("\n15:")
        //                             checkIntervals(15, intervals, () => {

        //                             })
        //                           })
        //                         })
        //                       })
        //                     })
        //                   })
        //                 })
        //               })
        //             })
        //           })
        //         })
        //       })
        //     })
        //   })
        })
      })
    })
  })
})

function checkIntervals(intervalMs, intervals, callback) {
  var iteration = 0;
  console.log("time expected: " + (intervalMs * intervals) + "ms")
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
        immediate();
      }
    }
  }

  function immediate() {
    console.time("interval_immediate");
    var iteration = 0;
    // var times = []
    var time = process.hrtime()[1];
    function innerLoop() {
      let oldTime = time;
      time = process.hrtime()[1];
      // times.push(time-oldTime);
      setImmediate(() => {
        if ((iteration) < intervals) {
          // console.log(time-oldTime);
          if(time-oldTime>)iteration++;
          innerLoop();
        } else {
          console.timeEnd("interval_immediate");
          // console.log(process.hrtime()[1]-time)
          loop();
        }
      });
    }
    innerLoop();
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