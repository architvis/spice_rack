

//global variables
let spiceRack1;
let spiceRack2;


class Entity {
  constructor(x, y, type = "entity", active = true) {
    this.visable = true;
    this.active = active;
    this.type = type;
    this.x = x;
    this.y = y;
    this.xrel = 0;
    this.yrel = 0;
  }

}


class SpiceHolder extends Entity {
  constructor(x, y, state = "none", displayString) {
    super(x, y, "spiceholder");
    this.state = state;
    this.displayString = displayString;
  }

}

class Renderer {
  constructor(canvasName = "canvas", width, height) {
    this.canvas = document.getElementById(canvasName);
    this.ctx = this.canvas.getContext("2d");
    this.entities = [];
  }
  addEntity(entity) {
    this.entities.push(entity);
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawEntities() {
    var entity;
    for (var i = 0; i < this.entities.length; i++) {
      entity = this.entities[i];
      switch (entity.type) {
        case "entity":
        case "inactive":
          // no rendering
          break;
        case "spicerack":
          this.drawSpiceRack(entity.x + entity.xrel, entity.y + entity.yrel);
          break;
        case "spiceholder":
          if (entity.state == "none") {
            this.drawSpiceHolder(entity.x + entity.xrel, entity.y + entity.yrel);
          } else if (entity.state == "full") {
            this.drawSpice(entity.x + entity.xrel, entity.y + entity.yrel, entity.displayString);
          }else if (entity.state == "half") {
            this.drawSpice(entity.x + entity.xrel, entity.y + entity.yrel);
          }
          break;
        default:
        // code block
      }
    }
  }
  drawSpiceHolder(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawSpice(x, y, str="") {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(str, x-(this.ctx.measureText(str).width/2), y+this.ctx.measureText("A").width/2);  // using the width of "A" for height as a quick fix, since getting height is a challenge other wise
    this.ctx.restore();
  }

  drawSpiceRack(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 150, 0, 2 * Math.PI);
    this.ctx.stroke();

    let arrow = { pos: [0, 150], height: 30, width: 30 }
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + arrow.pos[1] + arrow.height / 2);
    this.ctx.lineTo((x + arrow.width / 2), y + arrow.pos[1] + arrow.height / 2);
    this.ctx.lineTo(x, y + arrow.pos[1] - arrow.height / 2);
    this.ctx.lineTo(x - arrow.width / 2, y + arrow.pos[1] + arrow.height / 2);

    this.ctx.fill();
  }
}

class SpiceRack extends Entity {
  constructor(x, y, scale, degree, n = 7, renderer) {
    super(x, y, "spicerack");

    this.spices = [];
    this.scale = scale;
    this.position = [x, y];
    this.degree = degree;
    this.targetDegree = 0;
    this.state = "idle";
    this.degStep = 1;  // how much does it rotate per step movement
    this.direction = 0;

    var spice;
    let sin = Math.sin;
    let cos = Math.cos;
    for (let i = 0; i < n; i++) {
      let a = ((i * (360 / n)) * Math.PI / 180)
      let x = (0 * cos(a)) + (-sin(a) * (1));
      let y = (0 * (sin(a))) + (cos(a) * (1));
      spice = new SpiceHolder(x, y,"none");
      this.spices.push(spice)
      renderer.addEntity(spice);
    }

  }
  updateChildren() {
    this.spices.forEach((i) => {
      //zero relative position
      i.xrel = 0;
      i.yrel = 0;

      //rotate 
      let a = (this.degree * Math.PI / 180);
      let sin = Math.sin;
      let cos = Math.cos;
      i.xrel = (i.x * cos(a)) + (sin(a) * i.y);
      i.yrel = (i.x * (-sin(a))) + (cos(a) * i.y);

      //scale position
      i.xrel = i.xrel * this.scale;
      i.yrel = i.yrel * this.scale;


      //translate position
      i.xrel = i.xrel + this.position[0];
      i.yrel = i.yrel + this.position[1];
    })
  }

  moveTo(degrees) {
    if (this.state == "idle") {
      this.state = "moveto";
      this.targetDegree = degrees;
    } else {
      console.log("can't move in progress");
    }
  }

  runMoveTo(direction) { // [-1,0,1] = [counterclockwise, finddirection, clockwise]
    if (this.targetDegree == this.degree) {
      this.state = "idle";
      return;
    } else if (this.direction == 1) { //need to find direction
      this.degree += this.degStep;
    } else if (this.direction == -1) { //need to find direction
      this.degree -= this.degStep;
    }
  }

  run() {  //runs logic
    this.degree+=(this.degree <0) ? 360 :0;
    this.degree = this.degree %360;
    this.targetDegree+=(this.targetDegree <0) ? 360 :0;
    this.targetDegree = this.targetDegree %360;
    if (this.state == "moveto") {
      let distance;
      if((this.degree < this.targetDegree)){
        distance = this.targetDegree-this.degree;
        this.direction =  distance< 180 ? 1 : -1;
      }else{
        distance =  this.degree-this.targetDegree;
        this.direction =  distance> 180 ? 1 : -1;
      }
      this.state = (this.direction == 1) ? "movetoright" : "movetoleft";
    } else if (this.state == "movetoright") {
      this.direction = 1;
      this.runMoveTo(1);
    } else if (this.state == "movetoleft") {
      this.direction = -1;
      this.runMoveTo(-1);
    }
  }
}


function main() {
  let renderer = new Renderer("spiceRackSimulate", 200, 200);
  spiceRack1 = new SpiceRack(200, 200, 100, 0, 7, renderer);

  renderer.addEntity(spiceRack1);
  spiceRack2 = new SpiceRack(700, 200, 100, 0, 7, renderer);
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