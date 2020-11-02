
class Energy {
  constructor(cyclist) {
    this.cyclist = cyclist;
    this.pulse = 80;
      this.llano = 60 + random(30);
      this.montana = 60 + random(30);
      this.estadoForma = 80 + random(20);
      this.sprint = 60 + random(30);
    this.refProp = 15 + this.llano / 10;
      this.lastAcc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lastAccIndex = 0;
      this.points = 100;
      this.maxPot = 450 - (100 - this.estadoForma);
      this.maxAnaerobicPot = this.maxPot + this.sprint;
      this.force = 0;
      this.anaerobicPoints = 100;
    }

    getPower() {
        return (int) (this.pot * 100 / this.maxPot);
    }


    computeForce() {
        // P = F x V
        var pot = 0;

        // Resistencia Aire
        this.r_air = this.cyclist.velocity.x / (this.draftReduction + 2) / this.llano * 100;

        // Resistencia Mecanica
        this.r_mec = 5;

        // Resistencia Pendiente
        //this.r_pend = (this.cyclist.slope > 0) ? this.cyclist.slope * 400 / this.montana : 0;
        var multFactor = (this.cyclist.slope > 0)? 450 : 30;
        this.r_pend = this.cyclist.slope * multFactor / this.montana;

        // aceleracion
        this.f_acel = (this.cyclist.acceleration.x > 0)? this.cyclist.acceleration.x * 8 : 0;
        
        this.force = this.r_air + this.r_mec + this.r_pend + this.f_acel;

    }

    forceCompensation_option() {
        var pot = this.force * this.cyclist.velocity.x;
        var currMaxPot = this.maxPot - (100 - this.points / 2);

        if (pot > this.maxAnaerobicPot) {

            var restPot = pot - currMaxPot;
            var restForce = restPot / this.cyclist.velocity.x;

            var delta = this.force - restForce;

            var acc = delta / 8;

            return createVector(-acc, 0);
        } else if (pot > currMaxPot ) {
          var diffPot = pot - currMaxPot;
            this.anaerobicPoints =- diffPot * delta;
            var deltaX = 0;
            if (this.anaerobicPoints < 10)
              deltaX = -this.force;
            else
              deltaX = -0.01
            return createVector(deltaX, 0);
        } else {
          this.anaerobicPoints +=1;
          if (this.anaerobicPoints > 100)
            this.anaerobicPoints = 100;
          return createVector(0, 0);
        }

    }

    forceCompensation() {
        var pot = this.force * this.cyclist.velocity.x;
        var currMaxPot = this.maxPot - (100 - this.points / 2);

        if (pot > currMaxPot) {

            var restPot = pot - currMaxPot;
            var restForce = restPot / this.cyclist.velocity.x;

            var delta = this.force - restForce;

            var acc = delta / 8;

            return createVector(-acc, 0);
        } else {
            this.anaerobicPoints += 1;
            if (this.anaerobicPoints > 100)
                this.anaerobicPoints = 100;
            return createVector(0, 0);
        }

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
    
        //this.points -= this.pulse2 / 2500 * delta;

    this.pot = this.force * this.cyclist.velocity.x;
    if (!Number.isNaN(this.pot)) {
      this.points -= this.pot/4000 * delta;
    }

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