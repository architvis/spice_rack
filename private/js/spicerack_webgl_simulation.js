
import { Display, SpiceRack } from './entity.js';
import { Renderer } from './renderer.js';


window.socket = io();
window.inventory;


// Updating spice rack functions below this point

function generateUserInterface() {
  var ui = $("#moveto_ui");
  window.inventory.forEach((item) => {
    ui.append(' <button class="btn btn-secondary" onclick="requestMoveTo(' + item.uid + ')">' + item.name + '</button>');
  });
}

// Socket HTTP requests communication

function requestMoveToPoint(uid) {

};

function setupSocketCommunication(turnTable) {
  window.socket.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  window.socket.on('turnTable_rotation', (rotation) => {
    console.log("Turn Table rotation: " + rotation);
    turnTable.degree = rotation;
  });

  window.socket.on('turnTable_inventory', (inventory) => {
    console.log("Turn Table inventory message received");
    window.inventory = inventory;
    generateUserInterface();
  });
}


//global variables 
window.spiceRack1;
window.spiceRack2;
window.model;


function main() {

  let renderer = new Renderer("web_gl_simulation", 200, 200);
  let spiceRack1 = new SpiceRack(200, 200, 100, 0, 7, renderer);
  window.spiceRack1 = spiceRack1; //make global so html can access
  renderer.addEntity(window.spiceRack1);

  setupSocketCommunication(spiceRack1);

  let spiceRack2 = new SpiceRack(700, 200, 100, 0, 7, renderer);
  window.spiceRack2 = spiceRack2; //make global so html can access
  renderer.addEntity(spiceRack2);

  let display1 = new Display(790, 0, "inactive", "Display", "Val");
  window.display1 = display1; //make global so html can access
  renderer.addEntity(display1);
  display1.displayString = "Display";
  display1.displayValue = "val";

  // add spices to spice racks
  spiceRack1.spices[0].state = "full";
  spiceRack1.spices[0].displayString = "0";
  spiceRack1.spices[1].state = "full";
  spiceRack1.spices[1].displayString = "1";
  spiceRack1.spices[6].state = "full";
  spiceRack1.spices[6].displayString = "6";

  spiceRack2.spices[5].state = "full";
  spiceRack2.spices[5].displayString = "Salt";
  spiceRack2.spices[3].state = "full";
  spiceRack2.spices[3].displayString = "Pepper";
  spiceRack2.spices[0].state = "full";
  spiceRack2.spices[0].displayString = "Garlic";

  wrapper(renderer);

}

function wrapper(renderer) {
  let model = { lastTime: window.performance.now(), spiceRack1: spiceRack1, spiceRack2: spiceRack2 };
  renderer;
  animate();
  function animate() {
    let time = window.performance.now();
    let delta = Math.floor(1000 / (time - model.lastTime));
    model.lastTime = time;
    renderer.tick(delta);

    renderer.clearCanvas();
    renderer.drawEntities();


    window.requestAnimationFrame(animate);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  main();
});