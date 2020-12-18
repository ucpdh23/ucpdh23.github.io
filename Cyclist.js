class Cyclist {
    constructor(id) {
        this.id = id;

        this.maxSpeed = MAX_SPEED;

        this.slope = 0;

        this._mGoodPosition = 7;
        this._mDemarrajeGoodPosition = 3;
        this.selfAccTimer = 3;

        this.position = createVector(0 - random(items / 1.5), 3 - random(6));
        this.velocity = createVector(9, 0);
        this.acceleration = createVector(0, 0)
        this.acc_physics = createVector(0, 0);

        this.neighbour = []
        this.maxSteeringForce = MAX_STEERING_FORCE;
        this.neighborDist = NEIGHBOR_DIST;

        this.setViewingAngle(ANGLE);
        
        this.secuence = random(4);

        this._mSeparation = SEP_RANGE;
        this._stateMachine = [];
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


    show(reference) {
      if (reference < this.position.x
        || reference - this.position.x > 100) return;
      
      if (this.acceleration.x >= 0 || globalFirst.id === this.id)
        this.secuence = (this.secuence + 1) % 8;
        
        stroke(255)
        let posX = (reference - this.position.x) * 10
        this.posX = posX
        let posY = 160 + this.position.y * 10
        this.posY = posY

        if (clicked != null) {
          var diffClickedX = posX - clicked.x;
          var diffClickedY = posY - clicked.y;
          
          
          if (diffClickedX < 1 &&
              diffClickedX > -20 &&
              diffClickedY < 7 &&
              diffClickedY > -7) {
               // console.log("sel:"+ this.id)
                _debug_item = this.id;
              }
        }


        line(posX, posY, posX + 18, posY);

        if (this.colliding) stroke(255, 0, 0)
        else if (this.id % 10 == 1) stroke(0, 255, 0);
        
        
        var heading = 0;
        if (this.acceleration.x > 0.1 || (this.energy.r_pend > 20 && this.acceleration.x > 0)) {
          if (this.secuence < 2)
            heading = -1;
          else if (this.secuence < 4)
            heading = 0;
          else if (this.secuence < 6)
            heading = 1;
          else
            heading = 0;
        }

        ellipse(posX + 6, posY+heading, 4, 4);

        var isFlashing = this.computeStroke(this.actualBodyColor, this.flashing);

        triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            
        if (!isFlashing) {
          this.drawMallot(posX, posY, heading);
        }

        ellipse(posX + 14, posY - 2, this.secuence % 4, 1);
        ellipse(posX + 14, posY + 2, (this.secuence + 2) % 4, 1);

        stroke(255);

        if (_debug && this._wander != undefined) {
            this.drawVector(this._wander, posX, posY);
            // this.drawVector(this.velocity, posX, posY);
        }

        
        if (_debug_item != this.id) return;

        

        // purple
        stroke(255, 255, 255);
            //this._drawVector(p5.Vector.sub(globalFirst.velocity, this.velocity), posY+5, 50);
        var diffX = (globalFirst.velocity.x - this.velocity.x);
        var diffY = globalFirst.velocity.y - this.velocity.y;
        
        var headX = posX;
        if (posX < 140) headX = 140;
        textSize(8);
        text(((diffX > 0) ? ">>" : "<<") + " dVx:" + ((int)(diffX * 1000))/1000, headX, 30);
        text(((diffY < 0) ? "V" : "∆") + " dVy:" + ((int)(diffY * 1000))/1000, headX, 40);
        textSize(12);
        text("vel:"+((int)(this.velocity.x*3600))/1000, headX, 15);
        text("dist:" + ((int)((globalFirst.position.x - this.position.x) * 1000)) / 1000, headX, 60);
        text("id:" + (int)(this.id), headX + 100, 15)
        text("pulse:" + (int)(this.energy.pulse2),headX+100, 30)
        text("status:" + this.peekStateMachine().value, headX + 160, 30);
        text(" red.:" + this.energy.draftReduction, headX+ 100, 45);
        text("l:" + ((int)(this.energy.llano * 10))/10 + " m:" + ((int)(this.energy.montana*10))/10, headX+160, 15)
        text("E:" + ((int)(this.energy.points * 1000))/1000, headX+160, 45);
        text("pwr:" + dec(this.energy.pot, 1000), posX, 255);
        text("log:" + this.log, headX+100, 60);
        
        text("" + this.slope, 30, 60)
        line (30, 80, 45, 80);
        line(30, 80, 45, 80-this.slope)
        
        
        //text("slope:" + this.slope, 30, 60);
        text("f:" + dec(this.energy.force, 10) + " p:" + dec(this.energy.r_pend, 10) + " air:" + dec(this.energy.r_air, 10) + " ac:" + dec(this.energy.f_acel, 10), posX, 280);
        text("aPwr:" + dec(this.energy.anaerobicPoints, 10), posX + 70, 255);
        
        
        

        var powerLineStartX = posX - 10;
        var powerLineEndX = posX + 90;

        line(powerLineStartX, 290, powerLineEndX, 290);

        var power = this.energy.getPower();
        var powerPoint = powerLineStartX + power;

        triangle(
            powerPoint, 290,
            powerPoint - 5, 295,
            powerPoint + 5, 295);

        line(posX, 290, posX - this._forcesCompensation.x * 10, 290);
        
        if (_debug) {
        
        // green separation
        stroke(0, 250, 0)
        if (this._separation != undefined)
            this.drawVector(this._separation, posX, posY);
        //
        if (this._reduceDraft != undefined) {
        stroke(200,100,0)
        this.drawVector(this._reduceDraft,
            posX, posY);
        }

        // red
        stroke(255, 0, 0)
        this._drawVector(this.acceleration, posX, posY + 5, 10000);
        // blue - cohesion
        stroke(0, 0, 255)
        if (this._cohesion != undefined)
            this.drawVector(this._cohesion, posX, posY);

        // yellow - alligment
        stroke(255, 255, 0);
        if (this._alignment != undefined)
            this.drawVector(this._alignment, posX, posY)
        
        stroke(125, 125, 120);
        if (this._forcesCompensation != undefined) {
          this.drawVector(createVector(-this.energy.force,0), posX, posY);
          stroke(255,120,120)
          var vectorPosX = -this.energy.force*1000;
          this.drawVector(createVector(this.energy.forceCyclist,0), posX - vectorPosX, posY+5);
        }
        

}
        stroke(90);

        noFill()
        //ellipse(posX, posY, this.neighborDist*10, this.neighborDist*10);
        circle(posX, posY, this.neighborDist * 20);
        //ellipse(posX,posY,sepRange*10, sepRange*10);
        circle(posX, posY, this._mSeparation * 20);

        line(posX, posY,
            posX + Math.sin(3 / 2 * Math.PI + this.viewingAngle / 2) * this.neighborDist * 10,
            posY + Math.cos(3 / 2 * Math.PI + this.viewingAngle / 2) * this.neighborDist * 10);
        line(posX, posY,
            posX + Math.sin(3 / 2 * Math.PI + this.viewingAngle / 2) * this.neighborDist * 10,
            posY - Math.cos(3 / 2 * Math.PI + this.viewingAngle / 2) * this.neighborDist * 10);
    }


    drawVector(v, posX, posY) {
        this._drawVector(v, posX, posY, 1000);
    }

    _drawVector(v, posX, posY, factor) {
        line(posX, posY, posX - v.x * factor, posY + v.y * factor);
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

    goodPositionToFirst(first) {
      var diff = first.position.x /* + first.velocity.x -
      */ - this.position.x;

        var almostFirst = false;
        if (diff < 2) {
            var diffVel = first.velocity.x - this.velocity.x;
            if (diffVel < 0.5 && diffVel > -0.5) {
                this._gotoFirst = true;
                this._gotoFirstId = first.id;
            }
        }

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
          print("cerca");
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

        if (futurePos.y > 7) {
            result.add(createVector(0, -1))
        } else if (futurePos.y < -7) {
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

    computeForces(mAlig, mSep, mCoh, mComp = 0) {
        // 1o physics
        this._forcesCompensation = this.energy.forceCompensation(this.computeAvVel());
        //this._forcesCompensation.limit(2);

       /* if (this._forcesCompensation.x > 0) {
            this._forcesCompensation.mult(mComp);
        }*/

        // 2o rest of forces
      this._separation = this.separation();
      this._alignment = this.alignment();
      this._cohesion = this.cohesion();
      this._borderAvoid = this.borderAvoid();
     
      this._selfAcc = this.selfAcc();
      
      this._alignment.mult(mAlig);
      this._separation.mult(mSep);
      this._cohesion.mult(mCoh);
      
      this.acceleration.mult(0);
      
      if (this._selfAcc.x !== 0) {
        this._alignment.x /= 2;
        this._separation.x /= 2;
        this._cohesion.x /= 2;
        }

     // this.acceleration.add(this._forcesCompensation);
      this.acc_physics = this._forcesCompensation;
      
      this.acceleration.add(this._separation);
      this.acceleration.add(this._alignment);
      this.acceleration.add(this._cohesion);
      
      this.acceleration.add(this._borderAvoid);
      this.acceleration.add(this._selfAcc);
      
    }


    computeForces_1(first) {
      this.computeForces(0.75, 1.15, 0.3)

      this.acceleration.limit(this.maxSteeringForce);

    }

    computeForces_0(first) {
      if (first.id !== this.id) {
        this.computeForces(1, 1, 1);
        var after = this.goAfter(first);
        this.acceleration.add(after);
        
        this.acceleration.limit(this.maxSteeringForce);
      } else {
          this.computeForces(0, 0, 0, 1);
        
        this._wander = this.wander(4, 15);
        this._drive = this.drive();

        this.acceleration.add(this._wander);
        this.acceleration.add(this._drive);
        
        this.acceleration.limit(this.maxSteeringForce);
      }  
    }

    computeForces_2(first) {
      this.computeForces(0.75, 0.7, 0.1)

        this._goodPosition = this.goodPosition(first);

        this.acceleration.add(this._goodPosition);
    }

    computeForces_3(first) {
        this.computeForces(1, 0.2, 0.2);
    }
    
    computeForces_4(first) {
        this.computeForces(0.5, 0.75, 0);
        
        this._reduceDraft = this.reduceDraft();
        
       this.acceleration.add(this._reduceDraft);
       
       this.acceleration.limit(this.maxSteeringForce);
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

    computeNeighbour(cyclists, i, first, last, slope) {
      this.first = first;
      
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
                if (dist < this.neighborDist) {
                    this.neighbour.push(cyclists[i]);
                }
            }
        }

        this.peekStateMachine().transition({ first: first, cyclist: this });
        this.peekStateMachine().execute({ first: first, cyclist: this });
    }


    sendMessage(msg) {
        this.flashing = {
            tics: 300,
            color: createVector(0, 0, 255)
        };

        this.message = msg;
        this.peekStateMachine().transition({ first: globalFirst, cyclist: this, message: msg });
    }

    computeStroke(actual, flashing) {
      var isFlashing = false;
        var result = actual;
        if (flashing != undefined && flashing != null) {
            if (flashing.tics > 0) {
                result = flashing.color;
                flashing.tics = flashing.tics - 1;
                isFlashing= true;
            }
        }

        stroke(result.x, result.y, result.z);
        
        return isFlashing;
    }

    drawMallot(posX, posY, heading) {
      if (this.id < 10) {
        stroke(218, 165, 32)
        fill(218, 165, 32);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
            //stroke(0);
            //line(posX + 9, posY - 3+ heading,
             //posX + 9, posY - 1+ heading
            //);
             
      } else if (this.id < 20) {
      
        stroke(  0, 191, 225)
        fill(  0, 191, 225);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
           
      } else if  (this.id < 30) {
      
        stroke(  255, 255, 255)
        fill(  255, 255, 255);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
           
           stroke (0,255,0)
           fill(0, 255, 0)
           triangle(
            posX + 11, posY - 2+ heading,
            posX + 11, posY + 2+ heading,
            posX + 15, posY);
            noFill()
           
      } else if  (this.id < 40) {
      
        stroke(  255, 0,0)
        fill(  255, 0,0);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
           
           stroke (0,0,0)
           fill(0, 0, 0)
           triangle(
            posX + 11, posY - 2+ heading,
            posX + 11, posY + 2+ heading,
            posX + 12, posY);
            noFill()
           
      } else if  (this.id < 50) {
      
        stroke( 0 , 0,228)
        fill(  0,0,228);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
           
           stroke (255)
           fill(255)
           triangle(
            posX + 11, posY - 1+ heading,
            posX + 11, posY + 1+ heading,
            posX + 11, posY);
            noFill()
           
      } else if  (this.id < 60) {
      
        stroke(  255, 0, 0)
        fill(  255, 0, 0);
       triangle(
            posX + 9, posY - 3+ heading,
            posX + 9, posY + 3+ heading,
            posX + 15, posY);
            noFill()
           
           stroke (250)
           fill(250)
           triangle(
            posX + 11, posY - 2+ heading,
            posX + 11, posY + 2+ heading,
            posX + 15, posY);
            noFill()
           
      } 
    }
}
