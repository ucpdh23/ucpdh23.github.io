
let CANVAS_WIDTH = 300;
let CANVAS_HEIGHT = 300;

let PROFILE = [0, 0, 1, 2, -1, 4, 0, 0]

let cyclist;

let DELTA = 1/20;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  frameRate(20);
  
  cyclist = new Cyclist();
}

function draw() {
  background(20);
  
  cyclist.update(0, DELTA);
  
  cyclist.draw();
}

class Cyclist {
  constructor() {
    this.velocity = createVector (10, 0);
    this.position = createVector (0,0);
  }
  
  update(slope, delta) {
    var dis = p5.Vector.mult(this.velocity, delta);
    
    this.position.add(dis);
  }
  
  draw() {
    text("pos:" + ((int) (this.position.x* 1000))/ 1000, 10, 30);
    
    var posWheel1 = createVector(0, 0);
    var posWheel2 = createVector(45, 0);
    
    var posSeat = createVector(7, -20);
    var posMan = createVector(44, -20);
    
    var posDisco = createVector(20, 0);
    
   // var transform = c
    
    //posWheel1.mult()
    
    var transport = createVector(100, 100);
    posWheel1.add(transport);
    posWheel2.add(transport);
    posSeat.add(transport);
    posMan.add(transport);
    posDisco.add(transport);
    
    
    
    noFill();
    
    stroke(255);
    
    circle(posWheel1.x, posWheel1.y, 25);
    circle(posWheel2.x, posWheel2.y, 25);
    line(posWheel1.x, posWheel1.y,
      posSeat.x, posSeat.y);
    line(posWheel1.x, posWheel1.y,
      posDisco.x, posDisco.y);
    line(posDisco.x, posDisco.y,
      posSeat.x, posSeat.y);
    line(posWheel2.x, posWheel2.y,
      posMan.x, posMan.y);
    line(posSeat.x, posSeat.y,
      posMan.x, posMan.y);
    line(posDisco.x, posDisco.y,
      posMan.x, posMan.y);
      
    line(posWheel1.x, posWheel1.y,
      posWheel1.x + cos(this.position.x)*12.5,
      posWheel1.y + sin(this.position.x)*12.5)
    line(posWheel2.x, posWheel2.y,
      posWheel2.x + cos(this.position.x)*12.5,
      posWheel2.y + sin(this.position.x)*12.5)
    
  }
}