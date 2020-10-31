
let cyclists = [];
let road;
let meters;
let time = 0;
let _debug = true;
let _debug_item = 2;
let _drawHull = false;


let items = 40;


let SEP_RANGE = 1.8;
let NEIGHBOR_DIST = 7;
let MAX_SPEED = 20;
let MAX_STEERING_FORCE = 0.2;
let ANGLE = 210;

let tirando =[];

let globalFirst= null;
let globalLast = null;
let globalHull = null;

let clicked = null;

const canvasWidth = 1000;
const canvasHeight = 300;

let slider = null;
let showSlider = false;
let showSliderStartTime = null;
let showSliderLastClickTime = null;
let showSliderValue = 0;

let button;

let etapa = [2, 4, 4, 4, 5, 7, 8, 6, 7, 8, 9, 10];

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
  var selected = _debug_item;
  
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
        var slope = computeSlope(cyclists[i].position);
        cyclists[i].computeNeighbour(cyclists, i, first, last, slope);
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
    
    if (selected !== _debug_item) {
      if (showSlider) {
        hideOptions()
      }
      showOptions();
    }
    
    clicked = null;

    showSliderValue = 0;

    if (showSlider && showSliderStartTime + 3 < time) {
      hideOptions();
    }
}
function hideOptions() {
  _hideSlider();
  _hideButton();
}


function computeSlope(position) {
    var index = (int)(position.x / 1000);

    if (index < etapa.length) {
        return etapa[index];
    } else {
        return 0;
    }
}

function _hideButton() {
  button.hide();
  button.remove();
}

function _hideSlider() {
  slider.hide();
        slider.remove();
        showSlider = false;
}

function showOptions() {
  _showSlider();
  _showButton();
}

function _showButton() {
  button = createButton('pull');
  button.position(mouseX, mouseY+5);
  button.mousePressed(() => {
    cyclists[_debug_item].sendMessage('tira');
    
  });
}

function _showSlider() {
    slider = createSlider(0, 100, 50);
    slider.position(mouseX, mouseY + 30);
    slider.style('width', '80px');
    slider.touchEnded(sliderMouseClicked);
    slider.mouseReleased(sliderMouseClicked);


    showSlider = true;
    showSliderStartTime = time;
}

function mouseClicked() {
    ellipse(mouseX, mouseY, 5, 5);
  
    clicked = createVector(mouseX, mouseY)

  
    // prevent default
    return false;
}

function sliderMouseClicked() {
    
    showSliderValue= -(slider.value() - 50)/50;

    //slider.value(50);
    
    console.log("slider:"+showSliderValue)
    
    showSliderStartTime = time - 1
    
    cyclists[_debug_item].sendMessage('acelera#'+showSliderValue);

    return false;
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