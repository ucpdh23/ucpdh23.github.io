
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
        
        //this.cyclist.log='acc'+ this.cyclist.acceleration.x;

        // F = m * a
        var accCyclist = forceCyclist / 8;
        const accRes = negAcc - accCyclist;

      

       // accRes += this.cyclist.acceleration.x;

        return createVector(-accRes, 0);


        if (Math.abs(this.force - this.preForce) < 1) {
            return createVector(0, 0);
            // No hay cambios el ciclista est� estable
        } else {
            // Hay cambios, el ciclista tiene que establecer cuales son los nuevos m�rgenes de potencia
            var negAcc = this.force / 8;
            this.cyclist.log = 'acc:' + negAcc;
            return createVector(-negAcc, 0);
        }

      const lastPot = this.pot;
      
      if (this.force < 0) {
          var negAcc = this.force / 8;
          this.cyclist.log = 'force negative:' + negAcc;
          return createVector(-negAcc, 0);
      }
      
      var acc = this.force / 8;
      if (velAvg != 0) {
        // no soy el primero
        var ptarget = velAvg * this.force;
        
        var currPower=incrementalUpdate(lastPot, ptarget);
        
        var expected_vel = currPower / this.force;
        this.cyclist.log = 'target:'+ ptarget + ' c:'+currPower+' expVel:'+(int)(expected_vel*3600)/1000;
        var required_acc_x = expected_vel - this.cyclist.velocity.x;
        return createVector(required_acc_x, 0);
        
      } else {
        // soy el primero
        var expected_vel = this.expected_power / this.force;
        this.cyclist.log = 'expVel:' + expected_vel;
        var required_acc_x = expected_vel - this.cyclist.velocity.x;
        return createVector(required_acc_x, 0);
        
      }
      
      
    }
    __forceCompensation(vel_average =0) {
      const lastPot = this.pot;
      
      if (this.force < 0) {
        var acc = this.force / 8;
        this.cyclist.log= 'force negative:'+acc
        return createVector(-acc, 0);
      }
      
      // si vel_average es 0 entonces calcula velocidades a partir de la potencia.
      
      if (vel_average == 0) {
        var expected_vel = this.expected_power / this.force;
        this.cyclist.log = 'expVel:'+expected_vel;
        var required_acc_x = expected_vel - this.cyclist.velocity.x;
        return createVector(required_acc_x, 0);
      }
      
       this.cyclist.log = 'avVel:'+vel_average;
      
       // var pot = this.force * this.cyclist.velocity.x;
       var pot = this.force * vel_average;
        var currMaxPot = this.maxPot - (100 - this.points / 2);
        
        var acc_base = vel_average - this.cyclist.velocity.x;
        
        
        if (acc_base>0)
        acc_base *= 0.8;
        else
        acc_base *= 0.5;
        
        currMaxPot *= this.maxPotLevel/100;

        if (pot > currMaxPot) {

            var restPot = pot - currMaxPot;
            var restForce = restPot / this.cyclist.velocity.x;

            var delta = this.force - restForce;

            var acc = delta / 50;

            return createVector(acc_base -acc, 0);
        } else {
            this.anaerobicPoints += 1;
            if (this.anaerobicPoints > 100)
                this.anaerobicPoints = 100;
            return createVector(acc_base, 0);
        }

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
        this.cyclist.velocity.x)
      this.pulse = this.incrementPulse(
        this.pulse, newPulse);
      
      var accX = this.cyclist.acceleration.x;
      if (accX < 0) accX = 0;
      else accX = accX * 5 * delta;
      
      var accVar = this.computeAccVar(accX);
      this.pulse = this.pulse + accVar;
      
      this.pulse2 = this.pulse - this.draftReduction;
    }
    
    computePulse(pot, force, vel) {
      return 45 + pot / 500 * 120;
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

    __update(delta) {
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
    
    this.draftReduction = this.computeDraftReduction();

    this.pulse2 = this.pulse - this.draftReduction;
    
        //this.points -= this.pulse2 / 2500 * delta;
        
    var expectedPot = this.force * this.cyclist.velocity.x;
    
    if  (!Number.isNaN(expectedPot)) {
      
      this.pot = incrementalUpdate(this.pot, expectedPot);
      
      this.points -= this.pot/4000 * delta;
    } else {
      console.log(this.force)
    }

    /*this.pot = this.force * this.cyclist.velocity.x;
    if (!Number.isNaN(this.pot)) {
      this.points -= this.pot/4000 * delta;
    }*/

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