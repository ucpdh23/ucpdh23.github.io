
let cyclists = [];
let road;
let meters;
let time;
let _debug = true;
let _debug_item = 2;


let items = 50;
let demarrajeId = 11;

let sepRange = 1.8;
let neighborDist = 7;

let tirando =[];

let globalFirst= null;
let globalLast = null;
let globalHull = null;

const canvasWidth = 600;
const canvasHeight = 300;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
frameRate(50)
  
  for (i = 0; i < items; i++) {
    cyclists.push(new Cyclist(i))
  }
  
  setTimeout(
    function(){
   print('tira!');
      cyclists[2].sendMessage('tira');
    },
    35000

  );
  
  setTimeout(
    function() {
      cyclists[4].sendMessage('adelanta')
    },
    50000
  );
  
  road = new Road();
  
  meters = 0;
  time = 0;
}

function draw() {
  var delta = 1/20;
  meters = 0;
  
  var first = cyclists[0];
  var last = cyclists[0];
  
  var localHull = [];
  localHull.push([cyclists[0].position.x, cyclists[0].position.y]);
  
  for (i=1; i < items; i++) {
    if (first.position.x < cyclists[i].position.x)
      first = cyclists[i];
    
    if (last.position.x > cyclists[i].position.x)
      last =cyclists[i];
    
    localHull.push([cyclists[i].position.x, cyclists[i].position.y]);
  }
  
  globalFirst = first;

  var hullPoints = hull(localHull, 10);
  globalHull = hullPoints;
  
/*lPointsllPoints = hull(cyclists,
    10,
    ['.position.x', '.position.y']);
  print(hullPoints)
  */
 
  for (i = 0; i < items; i++) {
    cyclists[i].computeNeighbour(cyclists,i, first, last);
  }

  
  for (i = 0; i < items; i++) {
    currMeters = cyclists[i].update(delta);
    if (currMeters > meters)
      meters = currMeters
  }
  
  background(20);
  
  reference = road.show();
  for (i=0; i < items; i++)
    cyclists[i].show(reference);
    
  for (i = 0; i < hullPoints.length -1; i++){
     var startX = reference - hullPoints[i][0];
     var startY = 160 + hullPoints[i][1]*10;
     var endX = reference - hullPoints[i+1][0];
     var endY = 160 + hullPoints[i+1][1]*10;
     line(startX*10, startY,
     endX*10, endY)
}
  
  time = time + delta
}

class Group {
constructor(cyclists){
this._cyclists= cyclists;

}
  
  sendMessage(sender, message) {

  }
}

class Cyclist {
  constructor(id)  {
    this.id = id;
    this.maxSpeed = 20;
    this.state = 1;
    this._mGoodPosition = 7;
    this._mDemarrajeGoodPosition= 3;
    this.type = '';
    this.position = createVector(0 - random(items / 1.5), 3 - random(6));
    this.velocity = createVector(10,0);
    this.acceleration = createVector(0,0) //random(3),0);
    this.neighbour = []
    this.maxSteeringForce = 0.1 //0.0045
    this.viewingAngle = 210 * (Math.PI/180);
    this.secuence = random(4);
    //print("myId:"+this.id);
    this._mSeparation = sepRange;
    this._stateMachine = [];
    this.actualBodyColor = createVector(144 - this.id, 255 - this.id, this.id);
    
    
  this.pushStateMachine(createDefaultStateMachine());

  }
  
  pushStateMachine(stateMachine){
    this._stateMachine.push(stateMachine)
  }
  
  peekStateMachine() {
    return this._stateMachine[this._stateMachine.length - 1];
  }
  popStateMachine() {
    this._stateMachine.pop();
  }
  
  computeNeighbour(cyclists,i, first, last) {
    this.neighbour = []
    for (i = 0; i < items; i++) {
      if (this !== cyclists[i]) {
        let dist = this.position.dist(cyclists[i].position);
        //print("dist("+this.id+"):"+dist);
        if (dist < neighborDist) {
          this.neighbour.push(cyclists[i]);
        }
      }
    }
    //this.scaledPosition = p5.Vector.mult(this.position, createVector(0.555,1.666));
    this.peekStateMachine().transition({first: first, cyclist: this});
    this.peekStateMachine().execute({first: first, cyclist: this});
  }
  
  
  sendMessage(msg){
    this.flashing = {
      tics: 300,
      color: createVector(0,0,255)
    };
    
    this.message = msg;
    this.peekStateMachine().transition({first: globalFirst, cyclist: this, message: msg});
    }
  
  
  show(reference) {
    this.secuence = (this.secuence + 1) % 8;
    stroke(255)
    let posX = (reference - this.position.x)*10
    let posY = 160 + this.position.y * 10
    
    line(posX, posY, posX + 18, posY);
    
    if ( this.colliding) stroke(255,0,0)
    else if (this.id % 10 == 1) stroke(0,255,0)
    
    ellipse(posX + 6, posY, 4, 4);
    
    this.computeStroke(this.actualBodyColor, this.flashing);
    
    triangle(
      posX + 9, posY-3,
      posX + 9, posY+3,
      posX + 15, posY);
    
    ellipse(posX + 14, posY-2, this.secuence % 4, 1);
    ellipse(posX + 14, posY+2, (this.secuence + 2) % 4, 1);
    
    stroke(255);
    
    if (_debug && this._wander != undefined) {
      this.drawVector(this._wander, posX, posY);
     // this.drawVector(this.velocity, posX, posY);
      }
    
    if (!_debug) return;
    if (_debug_item != this.id) return;
    
    // green separation
    stroke(0,250,0)  
    if (this._separation != undefined)
      this.drawVector(this._separation, posX, posY);
      
      
    // red
    stroke(255,0,0)
    this._drawVector(this.acceleration, posX, posY+5, 10000);
    
    // purple
    stroke(255,255,255);
    if (this.id == globalFirst.id){
       this._drawVector(this.velocity, posX, posY+5, 50);
    } else {
      //this._drawVector(p5.Vector.sub(globalFirst.velocity, this.velocity), posY+5, 50);
      var diffX = (globalFirst.velocity.x-this.velocity.x);
      var diffY = globalFirst.velocity.
      y - this.velocity.y;
      text(((diffX > 0)? ">>":"<<") + " deltaX:" + diffX , 140, 30);
      text(((diffY<0)? "v":"∆") + " deltaY:"+ diffY, 140, 45);
    }

    // blue - cohesion
    stroke(0,0,255)
    if (this._cohesion != undefined)
      this.drawVector(this._cohesion,posX,posY);
      
    // yellow - alligment
    stroke(255,255,0);
    if (this._alignment != undefined)
      this.drawVector(this._alignment, posX, posY)
 
    stroke(90);
   
    noFill()
    //ellipse(posX, posY, neighborDist*10, neighborDist*10);
    circle(posX,posY, neighborDist*20);
    //ellipse(posX,posY,sepRange*10, sepRange*10);
    circle(posX, posY, sepRange*20);
    
    line(posX, posY,
    posX + Math.sin(3/2*Math.PI + this.viewingAngle/2)*neighborDist*10,
    posY + Math.cos(3/2*Math.PI + this.viewingAngle/2)*neighborDist*10);
    line(posX, posY,
      posX + Math.sin(3 / 2 * Math.PI + this.viewingAngle / 2) * neighborDist * 10,
      posY - Math.cos(3 / 2 * Math.PI + this.viewingAngle / 2) * neighborDist * 10);
  }
  
  computeStroke(actual, flashing) {
    var result = actual;
    if (flashing != undefined && flashing != null) {
      if (flashing.tics > 0) {
        result = flashing.color;
        flashing.tics = flashing.tics - 1;
      }
    }
    
    stroke(result.x, result.y, result.z);
  }



  drawVector(v, posX, posY){
    this._drawVector(v, posX,posY, 1000);
    }
  
  _drawVector(v,posX,posY,factor){
    line(posX, posY, posX - v.x*factor, posY + v.y*factor);
    }
  
  isColliding(other) {
    var myRect1 = this.getRectangle1();
    var myRect2 = this.getRectangle2();
    
    var otherRect1 = other.getRectangle1();
    var otherRect2 = other.getRectangle2();
    
    return myRect1.colladeWith(otherRect1)|| myRect1.colladeWith(otherRect2) || myRect2.colladeWith(otherRect1)|| myRect2.colladeWith(otherRect2);
    }
  
  getRectangle1(){
    var width_rectangle_1 = 0.05;
    return new Rectangle(
      this.position.x, this.position.y - width_rectangle_1, 1.7, width_rectangle_1*2
    );
  }
  
  getRectangle2
  (){
    var width_rectangle_2= 0.5;
    return new Rectangle(
      this.position.x - 0.5, this.position.y - 0.3, 0.5, 0.6
    );
  }
  
  inBoidViewRange(other) {
    var theta = Math.atan2(-this.velocity.y, this.velocity.x);
    
    return this._inBoidViewRange(other,theta,this.viewingAngle);
    }
  
  _inBoidViewRange(other, theta, viewingAngle){
    
	var obst_x = other.position.x - this.position.x
	var obst_y = other.position.y - this.position.y
    
    
	var obx = obst_x * Math.cos(theta) - obst_y * Math.sin(theta)
	var oby = obst_x * Math.sin(theta) + obst_y * Math.cos(theta)

	var a = Math.atan2(-oby, obx)

	var min = -viewingAngle/2
	var max = +viewingAngle/2
    
	return (a < max && a > min)
  }
  
  collision() {
    var steer = createVector(0, 0)
	var diff = createVector(0, 0)
	var count = 0
this.colliding = false;
	for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]
        

	    if(this.inBoidViewRange(other) && this.isColliding(other)) {
          var dist =this.position.dist(other.position)
          
          diff = p5.Vector.sub(this.position, other.position)
		steer.add(diff)
		count++;
          
          this.colliding= true;
	    }
	}
    
	if (count > 0) {
	    steer.div(count)
	    steer.limit(this.maxSteeringForce)
    }

	return steer
  }
  
  drive() {
    var theta = this.driveTheta;
    
    if (theta == undefined) theta = Math.PI / 2;
    
    var radius = 4;
    var distance = 1000;
    
    var driveX = radius * cos(theta);
    var driveY = radius * sin(theta);
    
    var steer = this.seek(createVector(
      this.position.x + distance + driveX,
      driveY
      
      ));
    
    this.driveTheta = theta + Math.PI / 10000;
    
    steer.limit(this.maxSteeringForce);
    steer.x = 0;
    return steer;
    
    }
  
  pursuit() {
    if (this.target == undefined) return null;
    
    var steer = this.seek(this.cyclists[this.target].position);
    steer.limit(this.maxSteeringForce)
      
    return steer;
  }
  
  computeBestEscape() {

    
    }
  
  aerodynamic() {
	var mass = createVector(0, 0)
	var count = 0

	for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]


	    var d = this.position.dist(other.position)
	    if (d < neighborDist && this.inBoidViewRange(other)&& other.position.x - 1.80 > this.position.x) {
		mass.add(other.position)
		count++
	    }
	}
    
    if (count > 0) {
	    mass.div(count) /* Centre of mass */
	
      // if (mass.x < this.position.x) return createVector(0);
      var steer = this.seek(mass);
      steer.limit(this.maxSteeringForce)
      
      return steer;
	}
    
	return mass
  }
  
  separation() {
    var steer = createVector(0, 0)
	var diff = createVector(0, 0)
	var count = 0

	for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]
        
        let dist = this.position.dist(other.position);
      

	    if (dist < this._mSeparation && this.inBoidViewRange(other)) {
          diff = p5.Vector.sub(this.position, other.position)
		diff.div(dist)
		steer.add(diff)
		count++
	    }
	}
    
	if (count > 0) {
	    steer.div(count)
	    steer.limit(this.maxSteeringForce)
    }

	return steer
  }
  
  goodPosition(first) {
    if (this._mGoodPosition == 0){
      return this.goodPositionToFirst(first);
    } else {
      return
      this.goodPositionInsideGroup(first);
    }
  }
  
  goodPositionToFirst(first) {
    if (this.position.x < first.position.x) {
      var border = this.inBorder();
      
      if (border == null) {
        var steer = createVector(0.2, 1);
        if (this.position.y < first.position.y) {
          steer.mult(-1);
        } else {
        
        }
        steer.limit(this.maxSteeringForce);
        return steer;
      } else if (border.x == 0){
        return createVector(0,0);
      } else {
        var steer = this.seek(border);
        steer.limit(this.maxSteeringForce);
        
        return steer;
      }
    }
  }
  
  
  
  inBorder() {
    var item = -1;
    
    for (var i = 0; i < globalHull.length - 1; i++) {
      var x = globalHull[i][0];
      var y = globalHull[i][1];
      
      if (x == this.position.x &&
         y == this.position.y) {
           item = i;
           break;
      }
    }
    
    if (item != -1) {
      if (item == 0) return createVector(0,0)
      
      if (item == globalHull.length-1) {
        return createVector(
          globalHull[0][0],
          globalHull[0][1]
        );
      } else {
        if (globalHull[item -1][0] > this.position.x) return createVector(
          globalHull[item-1][0],
          globalHull[item-1][1]+1);
        else return createVector(
          globalHull[item+1][0],
          globalHull[item+1][1]-1);
      }
    } else {
      return null;
    }
  }
  
  
  __goodPositionToFirst(first) {
    //var targetPosition = this.computeTargetPosition(first);
    if (this.position.x < first.position.x) {
      if (!this.canGoForward()) {
        var steer = createVector(0.2, 1);
        if (this.position.y < first.position.y) {
          steer.mult(-1);
        } else {
    
        }
        steer.limit(this.maxSteeringForce);
        return steer;
      } else {
        
        var deltaX = 0; //first.velocity.x;
        var deltaY = (first.position.y < this.position.y)? 1 : -1;
        var delta = createVector(deltaX, deltaY);
        
        //!!!!!!!!!!!!!
        var target = p5.Vector.add(first.position, delta);
     
        var diff = p5.Vector.sub(target, this.position)
        
        var mag = diff.mag();
        
        diff.normalize();
        
        if (mag < 1) {
          diff.mult(this.maxSpeed);
        } else 
        
        if (mag < 6){
          var firstRef = p5.Vector.mult(first.velocity, (6-mag)/6);
          diff.mult(mag / 6 * this.maxSpeed);
          diff.add(firstRef)
          //diff.mult(0.2);
        } else {
          diff.mult(this.maxSpeed);
        }
        
        //var diffVel = p5.Vector.sub(first.velocity, this.velocity); 
        //diff.sub(diffVel)
        diff.sub(this.velocity)
    
        diff.limit(this.maxSteeringForce)
        
        var finalMag = diff.mag();
        if (finalMag < 0.004)
          print('finito');
       // print(diff.mag())
        
        return diff;
      }
    
    }
    
    return createVector(0, 0);
  }
  
  computeTargetPosition(first) {
    
  }
  
  goodPositionInsideGroup(first) {
    if (this.position.x < first.position.x - this._mGoodPosition) {
        if (!this.canGoForward()) {
          var steer = createVector(0.2,1);
          if (this.position.y < first.position.y){
            steer.mult(-1);
          }
          steer.limit(this.maxSteeringForce);
          return steer;
        } else {
            var newY = first.position.y;
            var newX =random(this._mGoodPosition -2);
              
        
        var steer = this.seek(createVector(first.position.x - 2 - newX, newY));
      steer.limit(this.maxSteeringForce)
      return steer;
            }
        
    } 
    
    return createVector(0, 0);
  }
  
  canGoForward(){
    var inRange = this.computeItems(20, 4);
    //print(inRange);
    if (inRange.length > 0) 
       return false;
    //return true;
    
    inRange = this.computeItems(180, 1);
    
    if (inRange.length > 0)
       return false
    
    return true;
    
    }
  
  computeItems(angle, meters) {
  var items =[];
    
    var theta = Math.atan2(-this.velocity.y, this.velocity.x);
  
  for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]
    let dist = this.position.dist(other.position);
      

	    if (dist < meters && this._inBoidViewRange(other,
               theta,
               angle* (Math.PI/180))) {
          items.push(other);
          }
    }
  
  return items;
  
  }
  
  
  alignment() {
	var steer = createVector(0, 0)
	var count = 0

	for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]
 
	    var d = this.position.dist(other.position)
	    if (d < neighborDist && this.inBoidViewRange(other)) {
		steer.add(other.velocity)
		count++
	    }
	}

	if (count > 0) {
	    steer.div(count)
      steer.sub(this.velocity)
	
     steer.limit(this.maxSteeringForce);
	}
	return steer
  }
  
  seek(mass){
    var diff = p5.Vector.sub(mass, this.position)
    
    diff.normalize();
    diff.mult(this.maxSpeed);
    
    diff.sub(this.velocity)
    
     return diff;
    }
  
  peloton(first) {
      if (first.id == this.id) return;
      
      var mass = createVector(0, 0)
      
      if (this.position.y < first.position.y) 
        return createVector(0,0.00001)
      else
        return createVector(0,-0.00001)
	}

  cohesion() {
	var mass = createVector(0, 0)
	var count = 0

	for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]

	    var d = this.position.dist(other.position)
        var neighDist = neighborDist;
        if(this.id > 80) neighDist * 2;
        
	    if (d < neighDist && d > 1.6 && this.inBoidViewRange(other)){ //&& !this.isColliding(other)) {
		mass.add(other.position)
		count++
	    }
	}

	if (count > 0) {
	    mass.div(count) /* Centre of mass */
	
      // if (mass.x < this.position.x) return createVector(0);
     var steer = this.seek(mass);
      steer.limit(this.maxSteeringForce)
      
      return steer;
	  }
	  return mass
  } 
  
  wander(radius, distance) {
    return createVector(0,0)
   var theta = this.wanderTheta;
    
    if (theta == undefined) theta = Math.PI/2;
    
    var wanderX = radius * cos(theta);
    var wanderY = radius * sin(theta);
    
    var steer = this.seek(createVector(
      this.position.x + distance + wanderX,
      this.position.y + wanderY));
    
    steer.limit(this.maxSteeringForce);
    
    this.wanderTheta =theta + Math.PI / 16;
    
    return steer;
  }
  
  borderAvoid() {
    var result = createVector(0,0);
    
    var futurePos = p5.Vector.mult(this.velocity, 3)
    
    futurePos = p5.Vector.add(this.position, futurePos);
    
    if (futurePos.y > 7) {
      result.add(createVector(0, -1))
      } else if (futurePos.y < -7) {
        result.add(
      createVector(0, 1));
        }
result.limit(this.maxSteeringForce);
    
    return result;
    
    }
  
  
  computeForces_1(first) {
    this._separation = this.separation();
    this._alignment = this.alignment();
    this._cohesion = this.cohesion();
    this._borderAvoid = this.borderAvoid();

    this._alignment.mult(0.75);
    this._separation.mult(1.15);
    this._cohesion.mult(0.3);
    
    this.acceleration.mult(0);

    this.acceleration.add(this._separation);
    this.acceleration.add(this._alignment);
    this.acceleration.add(this._cohesion);

    this.acceleration.add(this._borderAvoid);
    
    this.acceleration.limit(this.maxSteeringForce);
    
  }
  
  computeForces_0(first) {
    this._wander = this.wander(4, 15);
    this._drive = this.drive();
    this._borderAvoid = this.borderAvoid();

    this.acceleration.mult(0);

    this.acceleration.add(this._wander);
    this.acceleration.add(this._drive);
    this.acceleration.add(this._borderAvoid);
    this.acceleration.limit(this.maxSteeringForce);
    this.acceleration.x = 0;
    
    }
  
  computeForces_2(first) {
    
    this._separation = this.separation();
   // this._collision  = this.collision();
    this._alignment = this.alignment();
    this._cohesion = this.cohesion();
    this._borderAvoid = this.borderAvoid();
    
    this._goodPosition = this.goodPosition(first);
    
    this._alignment.mult(0.75);
    this._separation.mult(0.7);
    this._cohesion.mult(0.1);
    
    this.acceleration.mult(0);
    
    this.acceleration.add(this._separation);
    this.acceleration.add(this._alignment);
    this.acceleration.add(this._cohesion);
    this.acceleration.add(this._borderAvoid);
    this.acceleration.add(this._goodPosition);
    
   // this.acceleration.mult(0.5);
    
  }
  update(time) {
    this.position.add(p5.Vector.mult(this.velocity, time));
    this.velocity.add(p5.Vector.mult(this.acceleration, time));
    this.velocity.limit(this.maxSpeed);
    //this.acceleration.mult(0);
    
    this.neighbour = []
    
    return this.position.x
  }
  
}



class Rectangle {
  constructor(x,y,lenght,width){
   this.x1 = x ;
   this.y1 = y ;
   this.x2 = x+lenght;
    this.y2= y+width;

    }
  
  colladeWith(other) {
  if (other.x1 > this.x2 || this.x1 > other.x2 || other.y1 > this.y2 || this.y1 > other.y2) return false;
    return true;
       
  }
  }