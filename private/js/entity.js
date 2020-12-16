export class Entity {
  constructor(x, y, type = "entity", active = true) {
    this.visable = true;
    this.active = active;
    this.type = type;
    this.x = x;
    this.y = y;
    this.xrel = 0;
    this.yrel = 0;
  }
  tick(delta){
  }

}

export class Display extends Entity{
  constructor(x, y, state = "none", displayString, displayValue) {
    super(x, y, "display");
    this.state = state;
    this.displayString = displayString;
    this.displayValue = displayValue;
    this.times = [0,0,0,0,0,0,0,0,0,0,0,0] // just to try not to get crazy numbers
  }
  tick(delta){
    this.times.push(delta);
    this.times.shift();

    let total = 0;
    this.times.forEach((i)=>{total+=i})
    this.displayValue= Math.floor(total/this.times.length); //average
  }
}

export class SpiceHolder extends Entity {
  constructor(x, y, state = "none", displayString) {
    super(x, y, "spiceholder");
    this.state = state;
    this.displayString = displayString;
  }

}

export class SpiceRack extends Entity {
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
      let a = ((i * (360 / n)) * Math.PI / 180); // angle
      let x = (0 * cos(a)) + (sin(a) * (1));
      let y = (0 * -(sin(a))) + (cos(a) * (1));
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
      i.xrel = (i.x * cos(a)) + (-sin(a) * i.y);
      i.yrel = (i.x * (sin(a))) + (cos(a) * i.y);

      //scale position
      i.xrel = i.xrel * this.scale;
      i.yrel = i.yrel * this.scale;


      //translate position
      i.xrel = i.xrel + this.position[0];
      i.yrel = i.yrel + this.position[1];
    })
  }

  // moveTo(degrees) {
  //   if (this.state == "idle") {
  //     this.state = "moveto";
  //     this.targetDegree = degrees;
  //   } else {
  //     console.log("can't move in progress");
  //   }
  // }

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

  // tick() {  //runs logic
  //   this.degree+=(this.degree <0) ? 360 :0;
  //   this.degree = this.degree %360;
  //   this.targetDegree+=(this.targetDegree <0) ? 360 :0;
  //   this.targetDegree = this.targetDegree %360;
  //   if (this.state == "moveto") {
  //     let distance;
  //     if((this.degree < this.targetDegree)){
  //       distance = this.targetDegree-this.degree;
  //       this.direction =  distance< 180 ? 1 : -1;
  //     }else{
  //       distance =  this.degree-this.targetDegree;
  //       this.direction =  distance> 180 ? 1 : -1;
  //     }
  //     this.state = (this.direction == 1) ? "movetoright" : "movetoleft";
  //   } else if (this.state == "movetoright") {
  //     this.direction = 1;
  //     this.runMoveTo(1);
  //   } else if (this.state == "movetoleft") {
  //     this.direction = -1;
  //     this.runMoveTo(-1);
  //   }
  //   this.updateChildren();
  // }

  tick() {  //runs logic
    // no logic besides updating children, will be updated externally when message is directed to it
    this.updateChildren();
  }
}
