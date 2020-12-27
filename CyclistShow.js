Cyclist.prototype.show = function(reference) {
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


Cyclist.prototype.drawVector = function(v, posX, posY) {
        this._drawVector(v, posX, posY, 1000);
    }

Cyclist.prototype._drawVector=function(v, posX, posY, factor) {
        line(posX, posY, posX - v.x * factor, posY + v.y * factor);
    }
    
Cyclist.prototype.computeStroke=function(actual, flashing) {
  var isFlashing = false;
  var result = actual;
  if (flashing != undefined && flashing != null) {
    if (flashing.tics > 0) {
      result = flashing.color;
      flashing.tics = flashing.tics - 1;
      isFlashing = true;
    }
  }

  stroke(result.x, result.y, result.z);

  return isFlashing;
}