
class Energy {
  constructor(cyclist) {
    this.cyclist = cyclist;
    this.pulse = 80;
    this.llano = 90;
    this.refProp = 15 + this.llano / 10;
    this.lastAcc = [0,0,0,0,0,0,0,0,0,0]
    this.lastAccIndex = 0;
  }
  
  update(delta) {
    var ms= this.cyclist.velocity.x * 3.6;
    var prop = ms / this.refProp;
    var g = prop * prop;
    var newPulse = g * 21.0084034 +58.9915966;
    
    if (newPulse +2 < this.pulse) {
      this.pulse -= 0.3;
    } else if (this.pulse +2<newPulse) {
      this.pulse += 0.5;
    } else {
      this.pulse = newPulse;
    }
    
    var accX = this.cyclist.acceleration.x;
    if (accX < 0) accX = 0;
    else accX = accX *5*delta;

    var accVar = this.computeAccVar(accX);
    this.pulse = this.pulse + accVar;
    
    
    
  }
  
  computeAccVar(acc) {
    this.lastAcc[this.lastAccIndex] = acc;
     var result = 0;
    for (var i=0; i<this.lastAcc.length; i++) {
      var index =(this.lastAccIndex + this.lastAcc.length) % this.lastAcc.length;
      result += this.lastAcc[index] / (i +1)
    }
    
    this.lastAccIndex = (this.lastAccIndex+1)%this.lastAcc.length;
    
    return result;
  }
}