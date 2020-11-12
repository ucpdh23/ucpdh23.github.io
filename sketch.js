
let cyclists = [];
let road;
let meters;
let time = 0;
let _debug = false;
let _debug_item = 2;
let _drawHull = false;


let items = 60;


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
let powerSlider = null;
let showSlider = false;
let showSliderStartTime = null;
let showSliderLastClickTime = null;
let showSliderValue = 0;

let button;

let etapa = [0, 2, 4, 7, -3, -5, -5, 0, 4, 5, 7, 8, 6, 7, 8, 9, 10, -3, -6,-6,-6,-7,-2, -5,-7,-9,-2,0,0,0,0,0,4,0,6,7,12,15,3];

function setup() {
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-holder');
  buildList();
  
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
  
  drawProfile();
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
        if (i < 10) {
          updateBox(document.getElementById('id_'+i), cyclists[i]);
        }
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

    if (showSlider && showSliderStartTime + 5 < time) {
      hideOptions();
    }
}
function hideOptions() {
  _hideSlider();
    _hideButton();
    _hidePowerSlider();
}

function buildList() {
  for (var i=1; i< 10; i++) {
    
  
  var clone = document.getElementById('id_0').cloneNode(true);
  clone.setAttribute('id', 'id_'+i);
  document.getElementById('list').appendChild(clone);
  }
}

let selected = null;
function updateBox(item, cyclist) {
  item.onclick = function() {
    _debug_item = cyclist.id;
    item.classList.toggle('selected');
    console.log(item.classList)
   // item.style.backgroundColor='red';
    
    if (selected != null)
      selected.classList.toggle('selected');
      
    selected = item;
    
    var maxPotLevel = cyclist.energy.maxPotLevel;
    
    var pwrSlider=document.getElementById('powerSliderId');
    pwrSlider.value = maxPotLevel;
    pwrSlider.onchange = function() {
      cyclist.energy.maxPotLevel = pwrSlider.value;
    };
    
    var accSlider = document.getElementById('accSliderId');
    accSlider.onchange = function() {
      var acc = (50 - accSlider.value)/50;
      cyclist.sendMessage('acelera#'+acc);
      accSlider.value = 50;
    };
    
    
    showSelected(cyclist);
  };
  item.getElementsByClassName('item-header-id')[0].innerHTML = cyclist.id;
  item.getElementsByClassName('item-header-features')[0].innerHTML = "Ll:" + (int)(cyclist.energy.llano) + "-Mn:"+(int)(cyclist.energy.montana) + "-Sp:"+(int)(cyclist.energy.sprint) + "-Fo:"+(int)(cyclist.energy.estadoForma);
 // item.getElementsByClassName('item-body')[0].innerHTML = (int)(cyclist.energy.points);
    
    var color = getColorForPercentage(cyclist.energy.points/100);
    item.getElementsByClassName('icon-batery')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
 
     color = getColorForPercentage(1-cyclist.energy.pulse2/200);
    item.getElementsByClassName('icon-heart')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
    
    color = getColorForPercentage(1-cyclist.energy.r_air/20);
    item.getElementsByClassName('icon-wind')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
 
    color = getColorForPercentage(1-cyclist.energy.getPower()/100);
    item.getElementsByClassName('icon-watts')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";

    if (selected === item) {
        showSelected(cyclist);
    }
}

var percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ];

function getColorForPercentage(pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return color;
}

function showSelected(cyclist) {
    var details = document.getElementById('details');
    
    

    document.getElementById("details-header-id").innerHTML = cyclist.id;
    document.getElementById("details-header-features-id").innerHTML =
        "Ll:" + (int)(cyclist.energy.llano) + "-Mn:" + (int)(cyclist.energy.montana) + "-Sp:" + (int)(cyclist.energy.sprint) + "-Fo:" + (int)(cyclist.energy.estadoForma);

    document.getElementById("details-header-status-power-id").innerHTML = (int) (cyclist.energy.pot);
    document.getElementById("details-header-status-pulse-id").innerHTML = (int)(cyclist.energy.pulse2);
    document.getElementById("details-header-status-velocity-id").innerHTML = dec(cyclist.velocity.x * 3600/1000, 10);
    document.getElementById("details-header-status-distance-id").innerHTML = dec(cyclist.position.x/1000, 1000);
    document.getElementById("details-header-status-pts-id").innerHTML = dec(cyclist.energy.points, 1000);
    document.getElementById("details-body-air-id").innerHTML = dec(cyclist.energy.r_air, 100);
    document.getElementById("details-body-slope-id").innerHTML = dec(cyclist.energy.r_pend, 100);
    document.getElementById("details-body-acc-id").innerHTML = dec(cyclist.energy.f_acel, 100);
}

function drawProfile() {
  var offset = 10;
  var offsetY = 200;
  var elevation = 0;
  for (var i=0;i<etapa.length;i++) {
    var desn = etapa[i];
  var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine.setAttribute('id', 'line'+ i);
  newLine.setAttribute('x1', ''+(offset + i*
  15));
  newLine.setAttribute('y1', '' + (200 - elevation));
  newLine.setAttribute('x2', ''+(offset +(i+1)*15));
  elevation = elevation + desn * 5;
  newLine.setAttribute('y2', '' +(200 - elevation));
  newLine.setAttribute("stroke", "black");
  var profile = document.getElementById('profile');
  profile.append(newLine);
  }
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


function _hidePowerSlider() {
    powerSlider.hide();
    powerSlider.remove();
}

function showOptions() {
    _showSlider();
    _showPowerSlider();
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
    slider.style('width', '100px');
    slider.touchEnded(sliderMouseClicked);
    slider.mouseReleased(sliderMouseClicked);


    showSlider = true;
    showSliderStartTime = time;
}

function _showPowerSlider() {
    var maxPotLevel = cyclists[_debug_item].energy.maxPotLevel;
    
    powerSlider = createSlider(0, 100, maxPotLevel);
    powerSlider.position(mouseX, mouseY + 60);
    powerSlider.style('width', '100px');
    powerSlider.touchEnded(powerSliderMouseClicked);
    powerSlider.mouseReleased(powerSliderMouseClicked);
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

function maxPowerUpdate(value) {
  
}

function powerSliderMouseClicked() {
    showPowerSliderValue = powerSlider.value();

    console.log("powerSlider:" + showPowerSliderValue)

    showSliderStartTime = time - 1;

    cyclists[_debug_item].energy.maxPotLevel = showPowerSliderValue;

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