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
    
    line(0, this.y1, canvasWidth, this.y1);
    line(0, this.y2, canvasWidth, this.y2);
   
    
    var startPoint = meters % 40;
    for (var i = -2; i < 40; i++) {
      if (i%2 != 0) continue;
      
      var itemPoint = startPoint + i*20
      line(itemPoint, this.middle, itemPoint + 20, this.middle);
    }
    
    return meters + 10
  }
}