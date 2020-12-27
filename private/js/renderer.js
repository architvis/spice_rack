export class Renderer {
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
      this.drawEntity( this.entities[i]);
    }
  }
  drawEntity(entity) {
      switch (entity.type) {
        case "entity":
        case "inactive":
          // no rendering
          break;
          case "spicerack":
            this.drawSpiceRack(entity);
            entity.spices.forEach((spice)=>{this.drawEntity(spice)})
            break;
        case "display":
          this.drawDisplay(entity.x, entity.y, entity.displayString, entity.displayValue);
          break;
        case "spiceholder":
          var colors = [];
          switch(entity.contents) { // colors are based on https://clrs.cc/ defaults
            case "0":
              colors = ["#DDDDDD","black"];
              break;
            case "1":
              colors = ["#FFDC00","white"];
              break;
            case "2":
              colors = ["#7FDBFF","white"];
              break;
            case "3":
              colors = ["#0074D9","white"];
              break;
            case "4":
              colors = ["#001f3f","white"];
              break;
            default:
              colors = ["black","white"];
              break;
          }
          this.drawSpice(entity.x + entity.xrel, entity.y + entity.yrel, entity.displayString,colors[0],colors[1] );
          break;
        default:
        // code block
      }
  }
  tick(){
    for (var i = 0; i < this.entities.length; i++) {
      this.entities[i].tick();
    }
  }
  drawSpiceHolder(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawSpice(x, y, str="", backgroundColor="black", textColor = "white") {
    this.ctx.save();
    this.ctx.fillStyle = backgroundColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = textColor;
    this.ctx.font = "20px Arial";
    this.ctx.fillText(str, x-(this.ctx.measureText(str).width/2), y+this.ctx.measureText("A").width/2);  // using the width of "A" for height as a quick fix, since getting height is a challenge other wise
    this.ctx.restore();
  }

  drawSpiceRack(rack) {
    var x = rack.x + rack.xrel;
    var y = rack.y + rack.yrel;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, 2 * Math.PI); // middle dot
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x, y, rack.platformRadius, 0, 2 * Math.PI);  // outer edge of platform
    this.ctx.stroke();

    //draw the arrow that shows which spice is selected and where to pick up from
    let arrow = { pos: [0, 150], height: 30, width: 30 }
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + arrow.pos[1] + arrow.height / 2);
    this.ctx.lineTo((x + arrow.width / 2), y + arrow.pos[1] + arrow.height / 2);
    this.ctx.lineTo(x, y + arrow.pos[1] - arrow.height / 2);
    this.ctx.lineTo(x - arrow.width / 2, y + arrow.pos[1] + arrow.height / 2);

    this.ctx.fill();
  }
  drawDisplay(x, y, str, value) {
    this.ctx.save();
    this.ctx.beginPath();
    let width = 200;
    let height = 50;
    this.ctx.rect(x, y, width, height);
    this.ctx.fill();
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    let display = str +": "+value;

    this.ctx.fillText(display, (x+width/2)-(this.ctx.measureText(display).width/2), y+height/2+(this.ctx.measureText("A").width/2));  // using the width of "A" for height as a quick fix, since getting height is a challenge other wise
    this.ctx.restore();
  }
}