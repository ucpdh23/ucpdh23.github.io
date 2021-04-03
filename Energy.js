
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
      this.r_vel=0;
      this.prePot = this.pot = 100;
      this.preSlope = this.slope = 0;
      
      // potencia a desarrollar si esta tirando.
      this.expected_power = 200;
      this.forceCyclist=15;
    }

    getPower() {
        return (int) (this.pot * 100 / this.maxPot);
    }


    computePhysics() {
        // Resistencia Aire
        var expected_r_air = this.cyclist.velocity.x / (this.draftReduction + 2) / this.llano * 100;
        if (this.cyclist.velocity.x > 12.5) {
          var air_delta = this.cyclist.velocity.x - 12.5;
          expected_r_air += air_delta*(air_delta);
        }
        
        this.r_air = incrementalUpdate(
          this.r_air,
          expected_r_air);

        // Resistencia Mecanica
        this.r_mec = (this.cyclist.velocity.x > 0)? 5 : 0;

        // Resistencia Pendiente
        this.preSlope = this.slope;
        this.slope = this.cyclist.slope;
        //this.r_pend = (this.cyclist.slope > 0) ? this.cyclist.slope * 400 / this.montana : 0;
        //var multFactor = (this.cyclist.slope > 0)? 450 : 200;
        var multFactor = (this.slope < 0)?
            30 :
            this.slope * 10;
           
        var expected_r_pend = (this.slope >= 0)? this.slope * multFactor / this.montana:
          this.slope * multFactor / this.bajada;
        //this.r_pend = incrementalUpdate(
         // this.r_pend,
          //expected_r_pend);
        this.r_pend = expected_r_pend;
        
        this.r_vel = this.cyclist.velocity.x;
        
        if (this.slope == 0){
          
        } else if (this.slope > 0) {
          this.r_vel *= (1 + (this.slope) / (3 + 3*this.montana/100));
        } else if (this.slope < 0){
         
        }
        
        // aceleracion
       // this.f_acel = (this.cyclist.acceleration.x > 10000)? this.cyclist.acceleration.x * 8 : 0;
        
        this.f_acel = 0;
        const newForce = this.r_air + this.r_mec + this.r_pend + this.f_acel + this.r_vel;

        this.preForce = this.force;
        this.force = newForce;

        this.prePot = this.pot;
    }

    

    forceCompensation(velAvg = 0, selfAcc=0) {
      var negAcc = this.force / 8;
      
      //hay gente delant y solo depend d ello
      if (velAvg != 0 /*&& selfAcc == 0*/) {
        velAvg += selfAcc;
        
        const currVel=this.cyclist.velocity.x;
        var diff = velAvg - currVel;
        
        var expAcc = negAcc + diff;
        // se calcula la aceleración necesaria para adaptarse a la velocidad del grupo
        
        var delta = 0.2;
        if (this.sprint < 75)
          delta = 0.1;
        else if (this.sprint > 85)
          delta = 0.3;
        
        
        this.forceCyclist = incrementalUpdate(this.forceCyclist, 8*expAcc, 0.2);
        //this.forceCyclist = 8* expAcc;
        // se calcula la fuerza necesaria para ejercer esa aceleración
      } else if (velAvg!=0 && selfAcc!=0){
        // hay gente delante, pero tiene comportamiento propio
        this.forceCyclist += selfAcc * 1;
      } else {
        if (this.preSlope == this.slope){
          
        } else {
          //this.cyclist.log='update slope';
          if (this.slope > this.preSlope) {
            // hay que mantener la potencia
           // var vel = this.forceCompensation * this.prePot;
          }
        }
      }
      
      let max = this.limitForce(this.cyclist.slope);
      
      if (this.forceCyclist > max){
        this.forceCyclist = incrementalUpdate(this.forceCyclist, max);
      }

        // F * V = pot
        var forceCyclist = this.forceCyclist;
        
        

        // F = m * a
        var accCyclist = forceCyclist / 8;
        const accRes = negAcc - accCyclist;

       // this.cyclist.log = 'accres:' + accRes;

        return createVector(-accRes, 0);
    }
    
    limitForce(slope) {
      let ref_maxForce = 40+ this.estadoForma*0.05;
      
      let r_mF_a = (this.anaerobicPoints < 50)? map(this.anaerobicPoints, ref_maxForce, ref_maxForce * 0.5, 50, 0) : ref_maxForce;
      
      let r_mF_p = (this.points < 30)? map(this.points, 30, 0, r_mF_a, r_mF_a * 0.5 ) : r_mF_a;
      
      this.maxForce = r_mF_p;
      this.cyclist.log = 'maxFroce:' + dec(this.maxForce, 100) + '-' + dec(ref_maxForce, 100);
      
      return this.maxForce;
      /*
      if (this.anaerobicPoints < 5) {
        this.maxForce = this.r_vel + 0.5 * (this.r_air + this.r_mec + this.r_vel);
      } else if (this.anaerobicPoints < 20){
        this.maxForce = (slope > 0)? 30 + 5 * slope : 30;
      } else {
        //this.maxForce = (slope > 0)? 30 + 10 * slope : 30;
        this.maxForce = 40+ this.estadoForma*0.05;
      }
     
      return this.maxForce;
      */
       //this.cyclist.log='force:'+ this .maxForce;
      
      /*
      this.maxForce = 15 + slope * 1.5
        - (100 - this.estadoForma) / 100 * 3
        - (100 - this.points) / 100 * 3;
      */
     // if (this.forceCyclist > this.maxForce)
      //  this.forceCyclist = this.maxForce;
    }


    resolvePercentage() {
      return (int)(this.forceCyclist * 100 / this.maxForce);
    }
    
    update(delta) {
      var expectedPot =
        30 + 
        this.forceCyclist * this.cyclist.velocity.x;
      
      this.draftReduction = this.computeDraftReduction();
      
      if  (!Number.isNaN(expectedPot)) {
        this.pot = incrementalUpdate(this.pot, expectedPot);
      
        this.points -= this.pot/9000 * delta;
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
      
      this.computeAnaerobic(this.pulse2);
      
      //this.cyclist.log = 'pot:' + this.resolvePercentage();
    }
    
    computeAnaerobic(pulse) {
      if (pulse > 200) {
         this.anaerobicPoints -= pulse - 200;
      } else {
        if (this.anaerobicPoints < 100)
          this.anaerobicPoints++;
      }
    }
    
    computePulse(pot, force, vel, point) {
      return 45 + force / this.maxForce*125;
    }
    
    incrementPulse(curr, exp) {
      if (exp < curr) {
        var diff = 0.05;
        if (curr - exp > 5) diff = 0.1;
        
        return curr - diff;
      } else if (curr < exp) {
        var diff = 0.075;
        if (exp + 5 > curr) diff = 0.1;
        
        return curr + diff;
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