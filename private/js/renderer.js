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