
// import { test } from "./entity.js";
import {SpiceRack} from './entity.js'; 
import {Renderer} from './renderer.js'; 


// class Entity {
//   constructor(x, y, type = "entity", active = true) {
//     this.visable = true;
//     this.active = active;
//     this.type = type;
//     this.x = x; 
//     this.y = y;
//     this.xrel = 0;
//     this.yrel = 0;
//   }

// }

//global variables
window.spiceRack1;
window.spiceRack2;

function main() {
  let renderer = new Renderer("spiceRackSimulate", 200, 200);
  let spiceRack1 = new SpiceRack(200, 200, 100, 0, 7, renderer);
  window.spiceRack1 = spiceRack1; //make global so html can access
  renderer.addEntity(spiceRack1);
  
  let spiceRack2 = new SpiceRack(700, 200, 100, 0, 7, renderer);
  window.spiceRack2 = spiceRack2; //make global so html can access
  renderer.addEntity(spiceRack2);
  
  animate(renderer, { spiceRack1: spiceRack1, spiceRack2: spiceRack2 });
}

function animate(renderer, model) {
  renderer.clearCanvas();

  //create spice racks
  model.spiceRack1.run();
  model.spiceRack1.updateChildren();
  // model.spiceRack1.degree+=.1;

  model.spiceRack2.run();
  model.spiceRack2.updateChildren();
  // model.spiceRack2.degree+=.1;

  // add spices to spice racks
  model.spiceRack1.spices[0].state= "full";
  model.spiceRack1.spices[0].displayString= "0";
  model.spiceRack1.spices[1].state = "full";
  model.spiceRack1.spices[1].displayString = "1";
  model.spiceRack1.spices[6].state = "full";
  model.spiceRack1.spices[6].displayString = "6";

  model.spiceRack2.spices[5].state = "full";
  model.spiceRack2.spices[5].displayString = "Salt";
  model.spiceRack2.spices[3].state = "full";
  model.spiceRack2.spices[3].displayString = "Pepper";
  model.spiceRack2.spices[0].state = "full";
  model.spiceRack2.spices[0].displayString = "Garlic";

  renderer.drawEntities();
  window.requestAnimationFrame(function () {
    animate(renderer, model);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  main();
});