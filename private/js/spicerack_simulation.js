
import { Display, SpiceRack } from './entity.js';
import { Renderer } from './renderer.js';

window.socket = io();
window.inventory = [];

// Socket HTTP requests communication
function requestMoveToPoint(uid) {
  $.get('/movetopoint/' + uid,  // url
    function (data, textStatus, jqXHR) {  // success callback
      // console.log('status: ' + textStatus + ', data:' + data);
    });
};

function requestSetName(id, name) {
  $.post("setName", { name: name, id: id }, function (data) {
  }, "json");
}

function requestSetContents(id, contents) {
  $.post("setContents", { contents: contents, id: id }, function (data) {
  }, "json");
}

function generateUserInterface() {
  var ui = $("#moveto_ui");
  ui.empty();
  window.inventory.forEach((item) => {
    var row = $('<div class="row" style=" margin:20px 0px;"></div>')

    var button = $(' <button class="btn-primary btn btn-block col-lg-2 col-xl-2 col-12">Select</button>');
    row.append(button);

    var textBoxContainer = $(' <div class="col-lg-2 col-xl-2 col-6" style="margin:auto;"></div>')
    var textBox = $('<input type="text" placeholder="New Spice" class=".form-control" style=" width:100%; height:100%;"></input>');
    textBoxContainer.append(textBox);
    row.append(textBoxContainer);

    var label = $(' <label class=" col-form-label col-form-label-md col-lg-2 col-xl-2 col-6" style="margin:auto;  text-align: center;">' + item.name + '</label>');
    row.append(label);

    var selectContainer = $('<div class="col-lg-2 col-xl-2 col-6"></div>');
    var select = $(`<select class="custom-select mr-sm-2" >
    <option selected value="null">Choose...</option>
    <option value="-1">No spice</option>
    <option value="0">Empty</option>
    <option value="1">1/4 Full</option>
    <option value="2">1/2 Full</option>
    <option value="3">3/4 Full</option>
    <option value="4">Full</option></select>`);
    select.val(item.contents);
    selectContainer.append(select);
    row.append(selectContainer);

    var contents = parseInt(item.contents);
    var progressBarContainer = $('<div class="col-lg-4 col-xl-4 col-6" style="margin:10px 0px; height:30px;"></div>');
    var progress = (contents != -1 ? contents * 25 : 0)
    var progressBar = $(' <div class="progress " style="height:100%; padding:0px;"> <div class="progress-bar progress-bar-striped" style="width: ' + progress + '%; " ></div></div>');
    progressBarContainer.append(progressBar);
    row.append(progressBarContainer);

    ui.append(row);

    // Element Events below this point
    button.on("click", () => { requestMoveToPoint(item.uid) });

    textBox.on('keypress', function (e) {
      if (e.which === 13) {
        requestSetName(item.uid, textBox.val());
      }
    });

    select.on("change", () => { 
      if(select.val() != "null"){ 
        requestSetContents(item.uid, select.val());
      }
    });

  });
  let calibration = $('<div class="row" style=" margin:20px 0px;"></div>');
  let leftButton = $('<button class="btn-primary btn btn-block col-lg-2 col-xl-2 col-12"><</button>');
  calibration.append(leftButton);
  var selectContainer = $('<div class="col-lg-2 col-xl-2 col-6"></div>');
  var select = $(`<select class="custom-select mr-sm-2" >
  <option selected value="null">Choose...</option>
  <option value="1">1 step</option>
  <option value="5">5 step</option>
  <option value="10">10 step</option>
  <option value="100">100 step</option>
  <option value="1000">1000 step</option>`);
  select.val(10);
  selectContainer.append(select);
  calibration.append(selectContainer);

  ui.append(calibration);
}

function setupSocketCommunication(turnTable) {
  window.socket.on('turnTable_rotation', (rotation) => {
    turnTable.degree = rotation;
  });

  window.socket.on('turnTable_inventory', (inventory) => {
    window.inventory = inventory;
    turnTable.replaceChildren(inventory);
    generateUserInterface();
  });
}

function main() {
  let renderer = new Renderer("web_gl_simulation", 200, 200);
  let spiceRack1 = new SpiceRack(250, 250, 150, 0, inventory);
  renderer.addEntity(spiceRack1);

  setupSocketCommunication(spiceRack1);

  wrapper(renderer);
}

function wrapper(renderer) {
  animate();
  function animate() {
    renderer.tick();
    renderer.clearCanvas();
    renderer.drawEntities();

    window.requestAnimationFrame(animate);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  main();
});