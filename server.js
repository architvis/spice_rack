const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'));

var mobileCallsSimulation = require('./mobileCallsSimulation');

app.use('/', mobileCallsSimulation);

// treating as an enum, don't have two states with the same value 
const rState = {
  INACTIVE: "inactive",  // not communicating, can't take request until active
  ACTIVE: "active",        // communicating and taking requests
  ROTATING: "rotating",  // moving spice platform, cannot take certain requests
  AWAITINGINPUT: "awaiting user input"  // when rack needs to wait for user input to say a task is complete, like "User removed and put back the spice" 
} 

app.get('/', (req, res) => {
  res.render('index.pug', {
    spiceRacks: 
      [{name:"rack 1", state:rState.ACTIVE}], 
    spices: 
      [{name: "salt", contents: "full"}, {name: "pepper", contents: "full"}],
    recipes: [{name:"Grilled chicken", spices:[{name: "salt", contents: "full"}, {name: "pepper", contents: "full"}]}]
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})