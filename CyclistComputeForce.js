Cyclist.prototype.computeForces= function(mAlig, mSep, mCoh, actionVector=null) {
  
  this._selfAcc = this.selfAcc();
  var allActions = createVector(0,0);
  allActions.add(this._selfAcc);
  if (actionVector != null)
    allActions.add(actionVector);
      
  var avVel = this.computeAvVel();
      
  // 1o physics
  this._forcesCompensation =
    this.energy.forceCompensation(
      avVel,
      allActions.x);

  // 2o rest of forces
  this._separation = this.separation();
  this._alignment = this.alignment();
  this._cohesion = this.cohesion();
  this._borderAvoid = this.borderAvoid();
     
     
  this._alignment.mult(mAlig);
  this._separation.mult(mSep);
  this._cohesion.mult(mCoh);
      
  this.acceleration.mult(0);
      
  if (this._selfAcc.x !== 0) {
    this._alignment.x /= 2;
    this._separation.x /= 2;
    this._cohesion.x /= 2;
  }

  this.acc_physics =
    this._forcesCompensation;
      
  this.acceleration.add(this._separation);
  this.acceleration.add(this._alignment);
  this.acceleration.add(this._cohesion);
      
  this.acceleration.add(this._borderAvoid);
}


Cyclist.prototype.computeForces_1=function(first) {
      this.computeForces(0.75, 1.15, 0.3)

      this.acceleration.limit(this.maxSteeringForce);

    }

Cyclist.prototype.computeForces_0=function(first) {
      if (first.id !== this.id) {
        var after = this.goAfter(first);
        
        this.computeForces(1, 1, 1, after);
        
        this.acceleration.add(after);
        
        this.acceleration.limit(this.maxSteeringForce);
      } else {
        var item = createVector(0,0);
        
        this._wander = this.wander(4, 15);
        this._drive = this.drive();
        
        item.add(this._wander);
        item.add(this._drive);
        
        this.computeForces(0, 0, 0, item);
        
        this.acceleration.add(this._wander);
        this.acceleration.add(this._drive);
        
        this.acceleration.limit(this.maxSteeringForce);
      }  
    }

Cyclist.prototype.computeForces_2=function(first) {
      this._goodPosition = this.goodPosition(first);
  
      this.computeForces(0.75, 0.7, 0.1,
        this._goodPosition)

        

        this.acceleration.add(this._goodPosition);
    }

Cyclist.prototype.computeForces_3=function(first) {
        this.computeForces(1, 0.2, 0.2);
    }
    
Cyclist.prototype.computeForces_4=function
(first) {
        this._reduceDraft = this.reduceDraft();
  
        this.computeForces(0.5, 0.75, 0,
          this._reduceDraft);
        
       this.acceleration.add(this._reduceDraft);
       
       this.acceleration.limit(this.maxSteeringForce);
    }
    
Cyclist.prototype.computeForces_5=function
(target) {
        let after =this.goAfter(target);
  
        this.computeForces(0.5, 0.75, 0,
          after);
        
       this.acceleration.add(after);
       
       this.acceleration.limit(this.maxSteeringForce);
    }