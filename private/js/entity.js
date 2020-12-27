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
  constructor(x, y, state = "none", displayString, radiusDistance = 100, contents=0) {
    super(x, y, "spiceholder");
    this.state = state;
    this.displayString = displayString;
    this.radiusDistance = radiusDistance;
    this.contents = contents;
  }
}

export class SpiceRack extends Entity {
  constructor(x, y, platformRadius,degree=0, children=[]) { // children are entities that attach to SpiceRack
    super(x, y, "spicerack");

    this.spices = [];
    this.platformRadius = platformRadius;
    this.position = [x, y];
    this.degree = degree;
    this.targetDegree = 0;
    this.state = "idle";
    this.degStep = 1;  // how much does it rotate per step movement
    this.direction = 0;

    this.addChildren(children);
  }

  replaceChildren(children=[]){
    this.clearSpices();
    this.addChildren(children);
  }

  addChildren(children=[]){
    var spice;
    let sin = Math.sin;
    let cos = Math.cos;
    for (let i = 0; i < children.length; i++) {
      let a = children[i].rotation*Math.PI/180; // angle
      let x = (sin(a) * (1));
      let y = (cos(a) * (1));

      spice = new SpiceHolder(x, y,children[i].state, children[i].name, children[i].radiusDistance, children[i].contents);
     this.spices.push(spice);
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

      // set relative radius distance of children from parent
      i.xrel = i.xrel * i.radiusDistance;
      i.yrel = i.yrel * i.radiusDistance;

      //translate position
      i.xrel = i.xrel + this.position[0];
      i.yrel = i.yrel + this.position[1];
    })
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

  clearSpices(){
    this.spices = [];
  }

  tick() {  //runs logic
    this.updateChildren();
  }
}
