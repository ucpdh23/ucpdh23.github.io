class Cyclist {
    constructor(id, number) {
        this.id = id;
        this.number=number;
        
        this.enabled = true;

        this.maxSpeed = MAX_SPEED;

        this.slope = 0;
        this.log='';
        
        this.roadWidth = 8;
        
        this.message = '';
        this.msgPayload = null;
        
        this.texts = [];

        this._mGoodPosition = 7;
        this._mDemarrajeGoodPosition = 3;
        this.selfAccTimer = 3;

        this.position = createVector(0 - random(items / 1.5), 3 - random(6));
        this.velocity = createVector(9, 0);
        this.acceleration = createVector(0, 0)
        this.acc_physics = createVector(0, 0);

        this.actions = {};
        this.actionMeters = [];
        this.neighbour = []
        this.maxSteeringForce = MAX_STEERING_FORCE;
        this.neighborDist = NEIGHBOR_DIST;

        this.setViewingAngle(ANGLE);
        
        this.secuence = random(4);

        this._mSeparation = SEP_RANGE;
        this._stateMachine = [];
        this._smCtx = {first: null, cyclist: this};
        this.actualBodyColor = createVector(144 - this.id, 255 - this.id, this.id);

        this.pushStateMachine(createDefaultStateMachine());

        this.energy = new Energy(this);

        if (this.energy.llano < 80) {
          this._mSeparation = this._mSeparation + 0.2;
        } else if (this.energy.llano > 85) {
          this._mSeparation = this._mSeparation - 0.2;
        }
    }

    setViewingAngle(angle) {
        this.viewingAngle = angle * (Math.PI / 180);
    }


    

    isColliding(other) {
        var myRect1 = this.getRectangle1();
        var myRect2 = this.getRectangle2();

        var otherRect1 = other.getRectangle1();
        var otherRect2 = other.getRectangle2();

        return myRect1.colladeWith(otherRect1) || myRect1.colladeWith(otherRect2) || myRect2.colladeWith(otherRect1) || myRect2.colladeWith(otherRect2);
    }

    getRectangle1() {
        var width_rectangle_1 = 0.05;
        return new Rectangle(
            this.position.x, this.position.y - width_rectangle_1, 1.7, width_rectangle_1 * 2
        );
    }

    getRectangle2
        () {
        var width_rectangle_2 = 0.5;
        return new Rectangle(
            this.position.x - 0.5, this.position.y - 0.3, 0.5, 0.6
        );
    }

    inBoidViewRange(other) {
        var theta = Math.atan2(-this.velocity.y, this.velocity.x);

        return this._inBoidViewRange(other, theta, this.viewingAngle);
    }

    _inBoidViewRange(other, theta, viewingAngle) {

        var obst_x = other.position.x - this.position.x
        var obst_y = other.position.y - this.position.y


        var obx = obst_x * Math.cos(theta) - obst_y * Math.sin(theta)
        var oby = obst_x * Math.sin(theta) + obst_y * Math.cos(theta)

        var a = Math.atan2(-oby, obx)

        var min = -viewingAngle / 2
        var max = +viewingAngle / 2

        return (a < max && a > min)
    }

    collision() {
        var steer = createVector(0, 0)
        var diff = createVector(0, 0)
        var count = 0
        this.colliding = false;
        for (var i = this.neighbour.length - 1; i >= 0; i--) {
            var other = this.neighbour[i]


            if (this.inBoidViewRange(other) && this.isColliding(other)) {
                var dist = this.position.dist(other.position)

                diff = p5.Vector.sub(this.position, other.position)
                steer.add(diff)
                count++;

                this.colliding = true;
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
        if (this._mGoodPosition === -2) {
            var cyclistToBet = findCyclist(this._gotoFirstId);

            return this.goodPositionBeforeFirst(cyclistToBet);
        } else if (this._mGoodPosition === 0) {
          
            return this.goodPositionToFirst(first);
        } else {
            this.goodPositionInsideGroup(first);
        }
    }
    
    goForwardAcc() {
      var border = this.inBorder();

            if (border == null) {
                var steer = createVector(0.2, 1);
                if (this.position.y < first.position.y) {
                    steer.mult(-1);
                } else {

                }
                steer.limit(this.maxSteeringForce);
                return steer;
            } else if (border.x == 0) {
                return createVector(0, 0);
            } else {
                var steer = this.seek(border);
                steer.limit(this.maxSteeringForce);
                
                var diffVel = first.velocity.x - this.velocity.x;
                
                var ref = (diffVel<-1)? 3:2;
                
                if (diff < ref) {
                  diffVel = diffVel * (ref - diff) / ref;
                  steer.x =+ diffVel;
                }

                return steer;
            }
    }

    goodPositionToFirst(first) {
      var diff = first.position.x /* + first.velocity.x -
      */ - this.position.x;

        /*var almostFirst = false;
        if (diff < 2) {
            var diffVel = first.velocity.x - this.velocity.x;
            if (diffVel < 0.5 && diffVel > -0.5) {
                this._gotoFirst = true;
                this._gotoFirstId = first.id;
            }
        }*/
        
        //this.log = 'diff;'+ diff + ' num'+ first.number;

        if (diff > 0.5) {
            var border = this.inBorder();

            if (border == null) {
                var steer = createVector(0.2, 1);
                if (this.position.y < first.position.y) {
                    steer.mult(-1);
                } else {

                }
                steer.limit(this.maxSteeringForce);
                return steer;
            } else if (border.x == 0) {
                return createVector(0, 0);
            } else {
                var steer = this.seek(border);
                steer.limit(this.maxSteeringForce);
                
                var diffVel = first.velocity.x - this.velocity.x;
                
                var ref = (diffVel<-1)? 3:2;
                
                if (diff < ref) {
                  diffVel = diffVel * (ref - diff) / ref;
                  steer.x =+ diffVel;
                }

                return steer;
            }
        } else {
          return createVector(0,0);
        }
    }

    goAfter(target) {
      
      var endPos = p5.Vector.add(target.position, createVector(-1.5, 0));
      //endPos.add(target.velocity);
      var diff = p5.Vector.sub(endPos, this.position);
      var dist = diff.mag();
      diff.normalize();
      
     // this.log = "follow:" + target.id + " x:"+diff.x+" y:"+diff.y;
      
      
      var speed = dist / 5;
      speed = Math.min(speed, target.velocity.x * 1.1);
      this.log = "follow:" + target.id + " dist:"+ dist
      
      var diffVel = p5.Vector.sub(target.velocity, this.velocity);
      diffVel.mult(-1)
      
      diff.mult(speed);
      
      diff.sub(diffVel);
      
      return diff;
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
            if (item == 0) return createVector(0, 0)

            if (item == globalHull.length - 1) {
                return createVector(
                    globalHull[0][0],
                    globalHull[0][1]
                );
            } else {
                if (globalHull[item - 1][0] > this.position.x) return createVector(
                    globalHull[item - 1][0],
                    globalHull[item - 1][1] + 0.75);
                else return createVector(
                    globalHull[item + 1][0],
                    globalHull[item + 1][1] - 0.75);
            }
        } else {
            return null;
        }
    }


    goodPositionInsideGroup(first) {
        if (this.position.x < first.position.x - this._mGoodPosition) {
            if (!this.canGoForward()) {
                var steer = createVector(0.2, 1);
                if (this.position.y < first.position.y) {
                    steer.mult(-1);
                }
                steer.limit(this.maxSteeringForce);
                return steer;
            } else {
                var newY = first.position.y;
                var newX = random(this._mGoodPosition - 2);

                var steer = this.seek(createVector(first.position.x - 2 - newX, newY));
                steer.limit(this.maxSteeringForce)
                return steer;
            }
        }

        return createVector(0, 0);
    }

    canGoForward() {
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
        var items = [];

        var theta = Math.atan2(-this.velocity.y, this.velocity.x);

        for (var i = this.neighbour.length - 1; i >= 0; i--) {
            var other = this.neighbour[i]
            let dist = this.position.dist(other.position);


            if (dist < meters && this._inBoidViewRange(other,
                theta,
                angle * (Math.PI / 180))) {
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
            if (d < this.neighborDist && this.inBoidViewRange(other)) {
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

    seek(mass) {
        var diff = p5.Vector.sub(mass, this.position)

        diff.normalize();
        diff.mult(this.maxSpeed);

        diff.sub(this.velocity)

        return diff;
    }

    cohesion() {
        var mass = createVector(0, 0)
        var count = 0

        for (var i = this.neighbour.length - 1; i >= 0; i--) {
            var other = this.neighbour[i]

            var d = this.position.dist(other.position)
            var neighDist = this.neighborDist;
            if (this.id > 80) neighDist * 2;

            if (d < neighDist && d > 1.6 && this.inBoidViewRange(other)) { //&& !this.isColliding(other)) {
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
        return createVector(0, 0);

        var theta = this.wanderTheta;

        if (theta == undefined) theta = Math.PI / 2;

        var wanderX = radius * cos(theta);
        var wanderY = radius * sin(theta);

        var steer = this.seek(createVector(
            this.position.x + distance + wanderX,
            this.position.y + wanderY));

        steer.limit(this.maxSteeringForce);

        this.wanderTheta = theta + Math.PI / 16;

        return steer;
    }

    borderAvoid() {
        var result = createVector(0, 0);

        var futurePos = p5.Vector.mult(this.velocity, 3)

        futurePos = p5.Vector.add(this.position, futurePos);

        if (futurePos.y > (this.roadWidth * 0.8)) {
            result.add(createVector(0, -1))
        } else if (futurePos.y < -(this.roadWidth*0.8)) {
            result.add(
                createVector(0, 1));
        }
        result.limit(this.maxSteeringForce);

        return result;

    }
    
    selfAcc() {
      if (this.startSelfAcc) {
        //print('selfAcc')
        this._selfAccInit = time;
        this.selfStartedSelfAcc = true;
        this.startSelfAcc = undefined;
        if (this.energy.pulse2 > 160) {
          if (this.selfAccLevel > 0)
            this.selfAccLevel /= 2;
        }
      } else if(this.selfStartedSelfAcc) {
          var diffTime = (time - this._selfAccInit) / this.selfAccTimer;
    
        
        if (diffTime > Math.PI) {
          this.selfStartedSelfAcc = false;
          this.enabled=true;
        }
        
        return createVector(this.selfAccLevel
          * Math.sin(diffTime), 0);
      }
      
      return createVector(0,0);
    }
    
    shouldReduceDraft() {
      return (this.energy.pulse2 > 120) 
       && (this.energy.draftReduction <= 2);
    }
    
    findCandidate() {
      var candidate = this.findCandidateToReduceDraft(45, 4)

      if (candidate === null) {
        candidate = this.findCandidateToReduceDraft(90, 6)
      }

      if (candidate === null) {
        candidate = this.findCandidateToReduceDraft(45,12)
      }

      if (candidate !== null
       && candidate !== undefined) {
         return candidate;
      } else {
        return null;
      }
    }

    reduceDraft() {
      return this.goAfter(this._reduceDraftCandidate);
    }
    _reduceDraft() {
        if (this._reduceDraftEnabled) {
          if (this.energy.draftReduction > 2) {
            this._reduceDraftEnabled = false;
          } else if (time - this._reduceDraftTime < 30) {
                if (Math.abs(this.velocity.x - this._reduceDraftCandidate.velocity.x) < 2) {
                    return this.goAfter(this._reduceDraftCandidate);
                   // console.log("goafter")
                } else {
                    this._reduceDraftEnabled = false;
                }
            } else {
                this._reduceDraftEnabled = false;
            }
        } else if (this.energy.pulse2 > 120) {
            if (this.energy.draftReduction <= 2) {
                var candidate = this.findCandidateToReduceDraft(45, 4)

                if (candidate === null) {
                    candidate = this.findCandidateToReduceDraft(90, 6)
                }

                if (candidate === null) {
                    candidate = this.findCandidateToReduceDraft(45, 12)
                }

                if (candidate !== null && candidate !== undefined) {
                    this._reduceDraftCandidate = candidate;
                    this._reduceDraftTime = time;
                    this._reduceDraftEnabled= true;

                    //console.log("try to reduce energy of " + this.id + " following " + candidate.id);

                } else {
                  this.log = "without candidate"
                }
            } else {
                // console.log("id:" + this.id + " draftReduction: " + this.energy.draftReduction);
            }
        }

        return createVector(0, 0);
    }

    findCandidateToReduceDraft(angle, meters) {
        var items = this.computeItems(angle, meters);

        var bestCandidate = null;
        var bestCandidateDistance = 100;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.position.x > this.position.x + 1.4 && Math.abs(this.velocity.x - item.velocity.x) < 2 ) {
                var distance = item.position.x - this.position.x;
                
                if (distance < bestCandidateDistance) {
                  bestCandidateDistance= distance;
                  bestCandidate= item;
                }
            }
        }
        
        return bestCandidate;
    }
    
    
computeAvVel() {
  if (this.first == this) return 0;
  
  if (this.position.x< 100)
    return this.first.velocity.x;
    
  let inRange = this.computeItems(170, 5);

  if (inRange.length == 0) return 0;

  var vel =0;
  var acc= 0;
  for(var i= 0; i<inRange.length; i++){
    var item = inRange[i]
    vel += item.velocity.x;
    acc += item.acc_physics.x;
  }
  
  
  return vel/inRange.length;
}

   
    
    update(time) {
        this.position.add(p5.Vector.mult(this.velocity, time));
        this.velocity.add(p5.Vector.mult(this.acceleration, time));
        this.velocity.add(p5.Vector.mult(this.acc_physics, time));
        this.velocity.limit(this.maxSpeed);
        //this.acceleration.mult(0);
        this.energy.update(time)
        

        this.neighbour = []

        return this.position.x
    }

    pushStateMachine(stateMachine) {
        this._stateMachine.push(stateMachine)
    }

    peekStateMachine() {
        return this._stateMachine[this._stateMachine.length - 1];
    }

    popStateMachine() {
        this._stateMachine.pop();
    }

    computeNeighbour(cyclists, i, first, last, environment) {
      this.first = first;
      var slope = environment.slope;
      this.roadWidth=environment.width;
      
      if (this.slope !== slope) {
        this.slope = slope;
        this.targetPot = this.energy.pot;
      } else {
        this.targetPot = 0;
      }
      
      if (this.energy.points < 0) {
        this.acceleration = createVector(0,0);
        this.velocity = createVector(0,0);
        return;
      }
      
        if (this.velocity.x > 15) {
            this._mSeparation = SEP_RANGE * (1 + (this.velocity.x - 15) / 10);
        }

        this.energy.computePhysics();

        this.log = "";
        this.neighbour = []
        for (i = 0; i < items; i++) {
            if (this !== cyclists[i]) {
                let dist = this.position.dist(cyclists[i].position);
                //print("dist("+this.id+"):"+dist);
                if (dist < this.neighborDist && cyclists[i].enabled) {
                    this.neighbour.push(cyclists[i]);
                }
            }
        }
        
        this.checkAction(this.position.x);

        this._smCtx.first = this.group.getFirst();
        this._smCtx.message = this.message;
        this.message=undefined;
        
        this.peekStateMachine()
            .transition(this._smCtx);
        this.peekStateMachine()
            .execute(this._smCtx);
            
        this._smCtx.message=undefined;
    }


    sendMessage(msg, payload=null) {
        this.flashing = {
            tics: 150,
            color: createVector(0, 0, 255)
        };

        this.message = msg;
        this.msgPayload = payload;
        
        this.managePort();
        /*
        this._smCtx.first
              = this.group.getFirst();
        this._smCtx.message = msg;
        this.peekStateMachine().transition(
          this._smCtx);
        this._smCtx.message=undefined;
        */
    }
    
    ports=[];
    
    managePort() {
      if (this.message == 'startPort') {
        this.texts.push(strTime(time)+'-Starting port:'+this.msgPayload.kms+'kms at '+ dec(this.msgPayload.slope,10)+'%');
        
        var portInfo = Object.assign({}, this.msgPayload);
        
        portInfo.time = time;
        this.ports.push(portInfo);
      } else if(this.message == 'endPort') {
        var portInfo = this.ports.pop();
        var elapseTime = time-portInfo.time;
        var velAvg = portInfo.kms / (elapseTime/3600);
        
        this.texts.push(strTime(time) + '-Finidhed port in ' + strTime(elapseTime) + ' ' + dec(velAvg,100));
      }
    }

}
