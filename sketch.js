
let cyclists = [];
let road;
let meters;
let time = 0;
let _debug = true;
let _debug_item = 2;
let _drawHull = false;


let items = 60;
let demarrajeId = 11;

let sepRange = 1.8;
let neighborDist = 7;

let tirando =[];

let globalFirst= null;
let globalLast = null;
let globalHull = null;

const canvasWidth = 600;
const canvasHeight = 300;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
frameRate(20)
  
  for (i = 0; i < items; i++) {
    cyclists.push(new Cyclist(i))
  }
  
  /*
  setTimeout(
    function(){
   print('tira!');
      cyclists[2].sendMessage('tira!');
    },
    35000

  );
  
  setTimeout(
    function() {
        cyclists[4].sendMessage('adelanta');
    },
    50000
  );
  */
  
  road = new Road();
  
  meters = 0;
  time = 0;
}

function draw() {
  var delta = 1/20;
  meters = 0;
  
  var first = cyclists[0];
  var last = cyclists[0];
  
  var localHull = [];
  localHull.push([cyclists[0].position.x, cyclists[0].position.y]);
  
  for (i=1; i < items; i++) {
    if (first.position.x < cyclists[i].position.x)
      first = cyclists[i];
    
    if (last.position.x > cyclists[i].position.x)
      last =cyclists[i];
    
    localHull.push([cyclists[i].position.x, cyclists[i].position.y]);
  }
  
  globalFirst = first;

  var hullPoints = hull(localHull, 10);
  globalHull = hullPoints;
  
  for (i = 0; i < items; i++) {
    cyclists[i].computeNeighbour(cyclists,i, first, last);
  }

  
  for (i = 0; i < items; i++) {
    currMeters = cyclists[i].update(delta);
    if (currMeters > meters)
      meters = currMeters
  }
  
  background(40);
  
  reference = road.show();
  for (i=0; i < items; i++)
    cyclists[i].show(reference);
    
    
    if (_drawHull) {
        for (i = 0; i < hullPoints.length - 1; i++) {
            var startX = reference - hullPoints[i][0];
            var startY = 160 + hullPoints[i][1] * 10;
            var endX = reference - hullPoints[i + 1][0];
            var endY = 160 + hullPoints[i + 1][1] * 10;
            line(startX * 10, startY,
                endX * 10, endY)
        }
    }

    var mins = (int)(time / 60);
    var secs = (int)(time) % 60;
    text(pad(mins, 2) + ":" + pad(secs, 2), 30, 13);

    time = time + delta;
}

class Group {
constructor(cyclists){
this._cyclists= cyclists;

}
  
  sendMessage(sender, message) {

  }
}




class Rectangle {
  constructor(x,y,lenght,width){
   this.x1 = x ;
   this.y1 = y ;
   this.x2 = x+lenght;
    this.y2= y+width;

    }
  
  colladeWith(other) {
  if (other.x1 > this.x2 || this.x1 > other.x2 || other.y1 > this.y2 || this.y1 > other.y2) return false;
    return true;
       
  }
  }