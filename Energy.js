
class Energy {
  constructor(cyclist) {
    this.cyclist = cyclist;
    this.pulse = 80;
      this.llano = 60 + random(30);
      this.montana = 60 + random(30);
      this.bajada = 70 + random(10);
      this.estadoForma = 80 + random(20);
      this.sprint = 60 + random(30);
    this.refProp = 15 + this.llano / 10;
      this.lastAcc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lastAccIndex = 0;
      this.points = 100;
      this.maxPot = 450 - (100 - this.estadoForma);
      this.maxAnaerobicPot = this.maxPot + this.sprint;
      this.preForce = this.force = 0;
      this.anaerobicPoints = 100;
      this.maxPotLevel = 100;
      this.r_pend = 0;
      this.r_air =0;
      this.prePot = this.pot = 100;
      
      // potencia a desarrollar si esta tirando.
      this.expected_power = 200;
      this.forceCyclist=10;
    }

    getPower() {
        return (int) (this.pot * 100 / this.maxPot);
    }


    computePhysics() {
        // P = F x V
        var pot = 0;

        // Resistencia Aire
        var expected_r_air = this.cyclist.velocity.x / (this.draftReduction + 2) / this.llano * 100;
        this.r_air = incrementalUpdate(
          this.r_air,
          expected_r_air);

        // Resistencia Mecanica
        this.r_mec = (this.cyclist.velocity.x > 0)? 5 : 0;

        // Resistencia Pendiente
        var slope = this.cyclist.slope;
        //this.r_pend = (this.cyclist.slope > 0) ? this.cyclist.slope * 400 / this.montana : 0;
        //var multFactor = (this.cyclist.slope > 0)? 450 : 200;
        var multFactor = (slope < 0)?
            30 :
            slope * 10;
           
        var expected_r_pend = (slope >= 0)? this.cyclist.slope * multFactor / this.montana:
        this.cyclist.slope * multFactor / this.bajada;
        //this.r_pend = incrementalUpdate(
         // this.r_pend,
          //expected_r_pend);
        this.r_pend = expected_r_pend;
        
        // aceleracion
       // this.f_acel = (this.cyclist.acceleration.x > 10000)? this.cyclist.acceleration.x * 8 : 0;
        
        this.f_acel = 0;
        const newForce = this.r_air + this.r_mec + this.r_pend + this.f_acel;

        this.preForce = this.force;
        this.force = newForce;

        if (this.cyclist.slope == 0)
          this.expected_power = 120; //incrementalUpdate(this.expected_power, 120);
        else if (this.cyclist.slope > 0)
          this.expected_power = 200;// incrementalUpdate(this.expected_power, 200);
        else
          this.expected_power = 30;

        this.prePot = this.pot;
    }

    

    forceCompensation(velAvg = 0, selfAcc=0) {
      var negAcc = this.force / 8;
      
      // hay gente delante
      if (velAvg != 0) {
        const currVel = this.cyclist.velocity.x;
        var diff = velAvg - currVel;
        
        var expAcc = negAcc + diff;
        // se calcula la aceleración necesaria para adaptarse a la velocidad del grupo
        
        this.forceCyclist = incrementalUpdate(this.forceCyclist, 8*expAcc, 0.5);
        //this.forceCyclist = 8* expAcc;
        // se calcula la fuerza necesaria para ejercer esa aceleración
      }
      

        // F * V = pot
        var forceCyclist = this.forceCyclist + selfAcc*8;
        
        this.cyclist.log='force:'+ this.forceCyclist;

        // F = m * a
        var accCyclist = forceCyclist / 8;
        const accRes = negAcc - accCyclist;


        return createVector(-accRes, 0);
    }
    
    update(delta) {
      var expectedPot = this.forceCyclist * this.cyclist.velocity.x;
      
      this.draftReduction = this.computeDraftReduction();
      
      if  (!Number.isNaN(expectedPot)) {
        this.pot = incrementalUpdate(this.pot, expectedPot);
      
        this.points -= this.pot/4000 * delta;
      }
      
      var newPulse = this.computePulse(
        this.pot,
        this.forceCyclist,
        this.cyclist.velocity.x,
        this.points);
        
      this.pulse = this.incrementPulse(
        this.pulse, newPulse);
      
      var accX = this.cyclist.acceleration.x;
      if (accX < 0) accX = 0;
      else accX = accX * 5 * delta;
      
      var accVar = this.computeAccVar(accX);
      this.pulse = this.pulse + accVar;
      
      this.pulse2 = this.pulse - this.draftReduction;
    }
    
    computePulse(pot, force, vel, point) {
      return 45 + force * 6 + (100 - point)/10;
    }
    
    incrementPulse(curr, exp) {
      if (exp +2 < curr) {
        return curr - 0.3;
      } else if (curr +2<exp) {
        return curr + 0.5;
      } else {
        return exp;
      }
    }

    
  
  computeDraftReduction() {
    var items = this.cyclist.computeItems(20,4).length;
    var items2 = this.cyclist.computeItems(90, 6).length;
    var itemsPulse = items + items2 / 2;
    return itemsPulse * 2;
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