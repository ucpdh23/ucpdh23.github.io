class Road {
  constructor() {
    this.width = 8;
    this.slope = 0;
    
    this.middle = canvasHeight / 2;
    
    this.computeLines();
  }
  
  computeLines() {
    var line = this.width * 10;
    
    this.y1 = this.middle - line;
    this.y2 = this.middle + line;
  }

  update(meters, environment) {
    this.meters = meters;
    this.slope = environment.slope;
    this.width = environment.width;
    
    this.computeLines();
  }
  
  show() {
    stroke(255);
    fill(255)
    textSize(13)
    text("meters:" + (int)(this.meters), 30, 30)
    text("speed:" + ((int)(globalFirst.velocity.x*3600))/1000, 30, 45)

    line(0, this.y1, canvasWidth, this.y1);
    line(0, this.y2, canvasWidth, this.y2);

    this.drawLines(this.meters + 10);
    
    this.drawKmLine(this.meters + 10);
    
    return this.meters+10;
  }
  
  drawKmLine(meters) {
    let previous = (int)(meters / 100);
    let diff = meters - previous*100;
    line(diff * 10, this.y1, diff*10, this.y2)
    text("kms:" + previous/10, diff*10, this.y1-10)
  }
  
  drawLines(meters) {
    var diff = ((int) (meters*10)) % 80;
    
      // start with white
      var start = diff - 120;
      
      for(var i = 0; i<15; i++) {
        line(start, this.middle, start+40, this.middle);
        start += 80;
      }
  }
}