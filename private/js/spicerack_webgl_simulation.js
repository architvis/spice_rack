
import { Display, SpiceRack } from './entity.js';
import { Renderer } from './renderer.js';


window.socket = io();
window.inventory = [];


// Socket HTTP requests communication

function requestMoveToPoint(uid) {
  $.get('/movetopoint/' + uid,  // url
    function (data, textStatus, jqXHR) {  // success callback
      console.log('status: ' + textStatus + ', data:' + data);
    });
};

// Updating spice rack functions below this point

function generateUserInterface() {
  var ui = $("#moveto_ui");
  ui.empty();
  window.inventory.forEach((item) => {
    // var el = $(' <button id="'+ item.uid+'" class=" btn btn-secondary" >' + item.name + '</button>');
    // ui.append(el);
    // el.on("click",()=>{requestMoveToPoint(item.uid)});
    var row = $('<div class="row" style=" margin:20px 0px;"></div>')

    var button = $(' <button class="btn-primary btn btn-block col-lg-2 col-xl-2 col-6">Select</button>');
    row.append(button);

    var label = $(' <label class=" col-form-label col-form-label-md col-lg-2 col-xl-2 col-6" style="margin:auto;  text-align: center;">' + item.name + '</label>');
    row.append(label);

    var textBoxContainer = $(' <div class="col-lg-4 col-xl-4 col-6" style="margin:auto;"></div>')
    var textBox = $('<input type="text" placeholder="New Spice" class=".form-control" style=" width:100%; height:100%;"></input>');
    textBoxContainer.append(textBox);
    row.append(textBoxContainer);

    var contents = parseInt(item.contents);
    var progressBarContainer = $('<div class="col-lg-4 col-xl-4 col-6" style="margin:10px 0px; height:30px;"></div>');
    var progress = (contents != -1 ? contents * 25 : 0)
    var progressBar = $(' <div class="progress " style="height:100%; padding:0px;"> <div class="progress-bar progress-bar-striped" style="width: ' + progress + '%; " ></div></div>');
    progressBarContainer.append(progressBar);
    row.append(progressBarContainer);

    ui.append(row);

    //logic is below this point
    button.on("click", () => { requestMoveToPoint(item.uid) });

    textBox.on('keypress', function (e) {
      if (e.which === 13) {
        console.log("Change "+ item.uid+" spice name => "+textBox.val());
      }
    });

  });
}

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
    turnTable.replaceChildren(inventory);
    generateUserInterface();
  });
}


//global variables 
window.spiceRack1;
window.spiceRack2;
window.model;

function updateSpiceRack() {

}

function main() {

  let renderer = new Renderer("web_gl_simulation", 200, 200);
  let spiceRack1 = new SpiceRack(200, 200, 100, 0, inventory);
  window.spiceRack1 = spiceRack1; //make global so html can access
  renderer.addEntity(window.spiceRack1);

  setupSocketCommunication(spiceRack1);

  let spiceRack2 = new SpiceRack(700, 200, 100, 0);
  window.spiceRack2 = spiceRack2; //make global so html can access
  renderer.addEntity(spiceRack2);

  let display1 = new Display(790, 0, "inactive", "Display", "Val");
  window.display1 = display1; //make global so html can access
  renderer.addEntity(display1);

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