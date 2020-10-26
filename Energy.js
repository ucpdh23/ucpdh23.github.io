
class Energy {
  constructor(cyclist) {
    this.cyclist = cyclist;
    this.pulse = 80;
      this.llano = 75 + random(15);
      this.montana = 75 + random(15);
    this.refProp = 15 + this.llano / 10;
      this.lastAcc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lastAccIndex = 0;
    this.points = 100;
  }


    computePower() {
        // P = F x V
        var pot = 0;

        // Resistencia Aire
        this.r_air = this.cyclist.velocity.x / (this.draftReduction + 1) / this.llano * 100;

        // Resistencia Mecanica
        this.r_mec = 5;

        // Resistencia Pendiente
        this.r_pend = (this.cyclist.slope > 0) ? this.cyclist.slope * 400 / this.montana : 0;

        // aceleracion
        this.f_acel = (this.cyclist.acceleration.x > 0)? this.cyclist.acceleration.x * 8 : 0;
        
        this.force = this.r_air + this.r_mec + this.r_pend + this.f_acel;

        this.pot = this.force * this.cyclist.velocity.x;
    }

    computeVelocity(pot) {
      
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
    
    var items = this.cyclist.computeItems(20,4).length;
    var items2 = this.cyclist.computeItems(90, 6).length;
    var itemsPulse = items + items2 / 2;
    this.draftReduction = itemsPulse * 2;

    this.pulse2 = this.pulse - this.draftReduction;
    
        this.points -= this.pulse2 / 2500 * delta;

        this.computePower();
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