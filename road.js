class Road {
  constructor() {
    this.width = 8;
    
    var line = this.width * 10;
    this.middle = canvasHeight / 2
    
    this.y1 = this.middle - line;
    this.y2 = this.middle + line;
  }
  

  update(meters) {
    this.meters = meters;
  }
  
  show() {
    stroke(255);
    fill(255)
    textSize(13)
    text("meters:" + (int)(meters), 30, 30)
    text("speed:" + ((int)(globalFirst.velocity.x*3600))/1000, 30, 45)
    line(0, this.y1, canvasWidth, this.y1);
    line(0, this.y2, canvasWidth, this.y2);
    /*
    var start = (int)((meters + 10)*100);
    var segment = start / 8;
    var suelo = Math.floor(segment);
    
    for (var item = 0; item < 5; item++) {
      var point = (start - suelo*8 -item*8) *10;
      line(
        point,
        this.middle,
        point + 40,
        this.middle
        );
      
    }
    
    return start / 100;
   */
    var start = (int)(meters) + 10;
    
    for (var i = start; i >= start - 100; i--) {
      if (i %8 == 0) line((start - i)*10, this.middle, (start - i + 4)*10, this.middle);
    }
    
    return meters + 10;
    
    
    var startPoint = meters % 40;
    for (var i = -2; i < 40; i++) {
      if (i%2 != 0) continue;
      
      var itemPoint = startPoint + i*20
      line(itemPoint, this.middle, itemPoint + 20, this.middle);
    }
    
    return meters + 10
  }
}