
let cyclists = [];
let road;
let meters;
let time;
let _debug = false;
let _debug_item = 2;


let items = 5;
let demarrajeId = 11;

let sepRange = 1.8;
let neighborDist = 15;

let tirando =[];

let globalFirst= null;

const canvasWidth = 600;
const canvasHeight = 300;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  frameRate(40);
  
  for (i = 0; i < items; i++) {
    cyclists.push(new Cyclist(i))
  }
  
  setTimeout(
    function(){
   print('tira!');
      cyclists[1].sendMessage('tira');
    },
    12000

  );
  
  road = new Road();
  
  meters = 0;
  time = 0;
}

function draw() {
  var delta = 1;
  meters = 0;
  
  var first = cyclists[0];
  var last = cyclists[0];
  
  for (i=1; i < items; i++) {
    if (first.position.x < cyclists[i].position.x)
      first = cyclists[i];
    
    if (last.position.x > cyclists[i].position.x)
      last =cyclists[i];
      
  }
  
  globalFirst = first;

    

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
    this.state = 1;
    this._mGoodPosition = 7;
    this._mDemarrajeGoodPosition= 3;
    this.type = '';
    this.position = createVector(0 - random(items / 2), 2 - random(4));
    this.velocity = createVector(1,0);
    this.acceleration = createVector(0,0) //random(3),0);
    this.neighbour = []
    this.maxSteeringForce = 0.0045
    this.viewingAngle = 210 * (Math.PI/180);
    this.secuence = random(4);
    //print("myId:"+this.id);
    this._mSeparation = sepRange;
    
    
  this._state = createMachine({
  initialState: 'init',
  init: {
    actions: {
      onEnter(ctx) {
       // console.log('off: onEnter')
      },
      onExit(ctx) {},
      onExecute(ctx){
         ctx.cyclist.computeForces_1(ctx.first);
      }
    },
    computeTransition(ctx){
      if (ctx.message == 'tira') {
        var targetName = 'preparePulling';
        
        if (ctx.first.id == ctx.cyclist.id) targetName = 'pulling';
        
        return {
      target: targetName,
        action(){
          ctx.message = '';
        
        },
      };
        }
    if (ctx.cyclist.id == ctx.first.id) {
      return {
        target: 'first',
        action(){},
        };
    }
   },
  },
  first: {
    actions: {
      onEnter(ctx) {},
      onExit(ctx) {},
      onExecute(ctx) {
      ctx.cyclist.computeForces_0(ctx.first);
      },
    },
    computeTransition(ctx){
    if (ctx.first.id != ctx.cyclist.id)
      return {
        target: 'init',
        action(){}
        };
    
    }
  },
    pulling: {
      actions: {
        onEnter(ctx){print('tirando');},
        onExit(ctx){},
        onExecute(ctx){
          if (tirando.includes(ctx.cyclist)) {
           ctx.cyclist.computeForces_0(ctx.first);
          
          }

        
        }
        
        },
      computeTransition(ctx){
        }
      
  },
    
    preparePulling: {
      actions: {
        onEnter(ctx){
          print('prepare');
        ctx.cyclist.preparePulling= null;
        },
        onExit(ctx){
    print('prepared');   
          ctx.cyclist.preparePulling = null;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
          if (ctx.first.id == ctx.cyclist.id) {
           print('firsr')
            tirando.push(ctx.cyclist);
            
            } else {
              
              
          ctx.cyclist._mGoodPosition = 0;
          ctx.cyclist.computeForces_2(ctx.first);
          
          }
        }
        
        },
      computeTransition(ctx){
        if (tirando.includes(ctx.cyclist))
        return {
          target: 'pulling',
          action(){}
        };
      }
      
  },
})

  }
  
  setDemarraje(step){
    this.type = 'demarraje';
    this.step1 = step + 400 + random(200);
    this.step2 = step + 1200 + random(200);

    }
  
  setTirando() {
    this.type = 'tirando';
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
    this._state.transition({first: first, cyclist: this});
    this._state.execute({first: first, cyclist: this});
    //this.computeForces(first);
  }
  
  checkTirando(first){
    if (tirando.contains(this)) {
      // already pulling the group
      
      } else {
           if (this.id == first.id){
      tirando.push(this);
      } else {
      
      }
    }
    }
  
  sendMessage(msg){
    this.message = msg;
    this._state.transition({first: globalFirst, cyclist: this, message: msg});
    }
  
  checkSalto(first){
    if (this.position.x < this.step1) this.state = 1;
    else  if (this.position.x < this.step2) {
      this._mSeparation =1.6;
      this._mGoodPosition = this._mDemarrajeGoodPosition;
      this.viewingAngle=90* (Math.PI/180);
      
      
    this.state=2;
    
    } else {
    this.state = 1;
      this.viewingAngle=210* (Math.PI/180);
      
      
    
    }
    
    

    
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
    if (this.type == 'demarraje') {
      stroke(0,0,255);
      } else {
    stroke(144 - this.id, 255 - this.id, this.id)
        }
    triangle(
      posX + 9, posY-3,
      posX + 9, posY+3,
      posX + 15, posY);
    
    ellipse(posX + 14, posY-2, this.secuence % 4, 1);
    ellipse(posX + 14, posY+2, (this.secuence + 2) % 4, 1);
    
    stroke(255);
    
    if (_debug && this._wander != undefined) {
      this.drawVector(this._wander, posX, posY);
      this.drawVector(this.velocity, posX, posY);
      }
    
    if (!_debug) return;
    if (_debug_item != this.id) return;
    
    // green separation
    stroke(0,250,0)  
    if (this._separation != undefined)
      this.drawVector(this._separation, posX, posY);

    stroke(255,0,0)
    this._drawVector(this.acceleration, posX, posY+5, 10000);
  stroke(255,0,255);  
    this._drawVector(this.velocity, posX, posY+5, 50);

    // blue - cohesion
    
    
    stroke(0,0,255)
    if (this._cohesion != undefined)
      this.drawVector(this._cohesion,posX,posY);
    // yellow - alligment
    stroke(255,255,0);
    if (this._alignment != undefined)
      this.drawVector(this._alignment, posX, posY)
 
    stroke(90);
    
    //line(posX,posY,posX- this.velocity.x*10, posY+this.velocity.y*10)
    noFill()
    ellipse(posX, posY, neighborDist*10, neighborDist*10);
    ellipse(posX,posY,sepRange*10, sepRange*10);
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
//    return this.position.x < other.position.x ;

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
          //diff.div(dist/50)
		steer.add(diff)
		count++;
          
          this.colliding= true;
	    }
	}
    
	if (count > 0) {
	    steer.div(count)
	    steer.limit(this.maxSteeringForce)
  //  print(steer)
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
  //  print(steer)
    }

	return steer
  }
  
  goodPosition(first) {
      if (this.position.x < first.position.x - this._mGoodPosition) {
        if (!this.canGoForward()) {
          var steer = createVector(0.2,1);
          if (this.position.y < first.position.y){
            steer.mult(-1);
          } else{
            
          }
          steer.limit(this.maxSteeringForce);
          return steer;
          } else {
            var newX = 0;
            var newY = first.position.y;
            if (this._mGoodPosition == 0) {
              newX = -2;
              if (first.position.y < this.position.y) {
                newY = newY +1;
              } else {
                newY = newY -1;
              }
              
              } else {
              newX =random(this._mGoodPosition -2);
              }
        
        var steer = this.seek(createVector(first.position.x - 2 - newX, newY));
      steer.limit(this.maxSteeringForce)
      return steer;
            }
        
    } 
    
    return createVector(0, 0);
  }
  
  canGoForward(){
    var inRange = this.computeItems(30, 4);
    //print(inRange);
    if (inRange.length > 0) 
    return false;
    else
      return true;
    }
  
  computeItems(angle, meters) {
  var items =[];
    
    var theta = Math.atan2(-this.velocity.y, this.velocity.x);
  
  for (var i = this.neighbour.length - 1; i >= 0; i--) {
	    var other = this.neighbour[i]
    let dist = this.position.dist(other.position);
      

	    if (dist < meters && this._inBoidViewRange(other,
                             theta                                 ,
                                                       angle* (Math.PI/180)
                                                             )) {
          
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
        
	    if (d < neighDist && this.inBoidViewRange(other)){ //&& !this.isColliding(other)) {
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
   var theta = this.wanderTheta;
    
    if (theta == undefined) theta = Math.PI/2;
    
    var wanderX = radius * cos(theta);
    var wanderY = radius * sin(theta);
    
//fill(255);

// ellipse(10, 10, 10,10);
    
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
  //  if (first.id == this.id) return;
    
    this._separation = this.separation();
    this._collision  = this.collision();
    this._alignment = this.alignment();
    this._cohesion = this.cohesion();
    this._borderAvoid = this.borderAvoid();
    this._peloton = this.peloton(first);
    this._pursuit = this.pursuit();
    this._aerodynamic = this.aerodynamic();
    //this._goodPosition = this.goodPosition(first);
    //this._wander = this.wander(3, 10);
    this._alignment.mult(0.75);
    this._separation.mult(1.15);
    this._cohesion.mult(0.3);
    if (this._pursuit != null)
      this._pursuit.mult(0.8);
    
    this.acceleration.mult(0);
    // this.acceleration.add(this._wander);
    this.acceleration.add(this._separation);
    this.acceleration.add(this._alignment);
    this.acceleration.add(this._cohesion);
    //this.acceleration.add(this._collision);
    //this.acceleration.add(this._peloton);
    if (this._pursuit != null)
      this.acceleration.add(this._pursuit);
    //this.acceleration.add(this._aerodynamic);
    this.acceleration.add(this._borderAvoid);
    //this.acceleration.add(this._goodPosition);
    
    this.acceleration.mult(0.5);
    
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
    this._collision  = this.collision();
    this._alignment = this.alignment();
    this._cohesion = this.cohesion();
    this._borderAvoid = this.borderAvoid();
    this._peloton = this.peloton(first);
    this._pursuit = this.pursuit();
    this._aerodynamic = this.aerodynamic();
    this._goodPosition = this.goodPosition(first);
    
    this._alignment.mult(0.75);
    this._separation.mult(0.7);
    this._cohesion.mult(0.1);
    if (this._pursuit != null)
      this._pursuit.mult(0.8);
    
    this.acceleration.mult(0);
    
    this.acceleration.add(this._separation);
    this.acceleration.add(this._alignment);
    this.acceleration.add(this._cohesion);
    //this.acceleration.add(this._collision);
    //this.acceleration.add(this._peloton);
    if (this._pursuit != null)
      this.acceleration.add(this._pursuit);
    //this.acceleration.add(this._aerodynamic);
    this.acceleration.add(this._borderAvoid);
    this.acceleration.add(this._goodPosition);
    
   // this.acceleration.mult(0.5);
    
  }
  update(time) {

    
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    //this.acceleration.mult(0);
    
    this.neighbout = []
    
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