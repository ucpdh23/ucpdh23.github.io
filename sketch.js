
let cyclists = [];
let road;
let meters;
let time = 0;
let _debug = false;
let _debug_item = 0;
let _drawHull = false;


let items = 5;


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

let profile = new Profile();

function setup() {
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-holder');
  buildList();
  
frameRate(20)
  
  var number=1;
  for (i = 0; i < items; i++) {
    cyclists.push(new Cyclist(i, number))
    number++;
    if (i!=0 && i % 6== 0) number += 3;
  }
  
 
  road = new Road();
  
  meters = 0;
  time = 0;
  
  drawProfile();
}

function draw() {
  /*if (meters > 820) frameRate(20);
  else if (meters > 780) frameRate(2);
  else if (meters > 620) frameRate(20);
  else if (meters > 580) frameRate(2);
  else if (meters > 420) frameRate(20);
  else if (meters > 380) frameRate(2);
  else if (meters > 220) frameRate(20);
  else if (meters > 180) frameRate(2);*/
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
        var environment = profile.computeEnvironment(cyclists[i]);
        cyclists[i].computeNeighbour(cyclists, i, first, last, environment);
        if (i < 7) {
          updateBox(document.getElementById('id_'+i), cyclists[i]);
        }
    }

  
  for (i = 0; i < items; i++) {
    currMeters = cyclists[i].update(delta);
    if (currMeters > meters)
      meters = currMeters
  }
  
  background(40);
  
  var selectedMeters = cyclists[_debug_item].position.x;
  if (selectedMeters < meters - 100) {
    road.update(selectedMeters + 10, profile.computeEnvironmentByPos(selectedMeters));
  } else {
    road.update(meters, profile.computeEnvironmentByPos(meters));
  }
  
  // road.update(meters);
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

    text(strTime(time), 30, 13);

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
  for (var i=1; i< 7; i++) {
    
  
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
    //console.log(item.classList)
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
  item.getElementsByClassName('item-header-id')[0].innerHTML = cyclist.number;
  item.getElementsByClassName('item-header-features')[0].innerHTML = "Ll:" + (int)(cyclist.energy.llano) + "-Mn:"+(int)(cyclist.energy.montana) + "-Sp:"+(int)(cyclist.energy.sprint) + "-Fo:"+(int)(cyclist.energy.estadoForma);
 // item.getElementsByClassName('item-body')[0].innerHTML = (int)(cyclist.energy.points);
    
    var color = getColorForPercentage(cyclist.energy.points/100, percentColors);
    item.getElementsByClassName('icon-batery')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
 
     color = getColorForPercentage(1-cyclist.energy.pulse2/200, percentColors);
    item.getElementsByClassName('icon-heart')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
    
    color = getColorForPercentage(1-cyclist.energy.r_air/20, percentColors);
    item.getElementsByClassName('icon-wind')
    [0].style.backgroundColor = "rgb("+color.r+","+color.g+","+color.b+")";
 
    color = getColorForPercentage(1-cyclist.energy.getPower()/100, percentColors);
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


function showSelected(cyclist) {
    var details = document.getElementById('details');
    
    

    document.getElementById("details-header-id").innerHTML = cyclist.number;
    document.getElementById("details-header-features-id").innerHTML =
        "Ll:" + (int)(cyclist.energy.llano) + "-Mn:" + (int)(cyclist.energy.montana) + "-Sp:" + (int)(cyclist.energy.sprint) + "-Fo:" + (int)(cyclist.energy.estadoForma);

    document.getElementById("details-header-status-power-id").innerHTML = (int) (cyclist.energy.pot);
    document.getElementById("details-header-status-pulse-id").innerHTML = (int)(cyclist.energy.pulse2);
    document.getElementById("details-header-status-velocity-id").innerHTML = dec(cyclist.velocity.x * 3600/1000, 10);
    document.getElementById("details-header-status-distance-id").innerHTML = dec(cyclist.position.x/1000, 1000);
    document.getElementById("details-header-status-pts-id").innerHTML = dec(cyclist.energy.points, 1000);
   // document.getElementById("details-body-air-id").innerHTML = dec(cyclist.energy.r_air, 100);
    document.getElementById("details-body-slope-id").innerHTML = dec(cyclist.energy.r_pend, 100);
    document.getElementById("details-body-acc-id").innerHTML = dec(cyclist.energy.f_acel, 100);

    var msg_ul = document.getElementById('details-body-messages');
    buildUl(msg_ul, cyclist);
    
    var canvas = document.getElementById('idForces');
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0000FF"
    ctx.fillRect(50, 10,
      cyclist.energy.f_acel *100, 10);
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(50, 20,
      cyclist.energy.r_pend *10, 10);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(50, 30,
      cyclist.energy.r_air * 10, 10);
    
      
    var canvas2 = document.getElementById('idPower');
    var ctx2 = canvas2.getContext("2d");
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.fillStyle = '#FFFFFF'
    ctx2.fillRect(50,5, 100, 5);
   
    ctx2.fillStyle = "#0000FF"
    ctx2.fillRect(50, 10,
      cyclist.energy.getPower(), 10);
    
    var canvas3 = document.getElementById('idEnergy');
    var ctx3 = canvas3.getContext("2d");
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
    
    var end = 1.5 * Math.PI * cyclist.energy.points / 100 - Math.PI/4;
    
   var color = getColorForPercentage(cyclist.energy.points/100, percentColors);
    ctx3.beginPath()
    ctx3.lineWidth = 1;
    ctx3.strokeStyle = "#000000"
    ctx3.arc(55, 50, 50, -Math.PI / 4, 1.25 * Math.PI, false);
    ctx3.stroke();
    ctx3.beginPath();
    ctx3.lineWidth = 10;
    ctx3.strokeStyle = '#' + rgbToHex(color.r) + rgbToHex(color.g) + rgbToHex(color.b);
    ctx3.arc(55, 50, 50, -Math.PI / 4, end, false);
    
    ctx3.stroke();
    ctx3.lineWidth = 1;
}

function buildUl(element, cyclist) {
  var arr = cyclist.texts;
  
  element.innerHTML = '';
  
  
  for (var i=0; i < arr.length; i++) {
    var li = document.createElement('li')
    li.innerHTML = arr[i];
    li.setAttribute('style', 'display: block;');
    element.appendChild(li);
  }
  
  /*for (i = 0; i <= arr.length - 1; i++) {
     /*   var li = document.createElement('li');     // create li element.
        li.innerHTML = arr[i];      // assigning text to li using array value.
           // remove the bullets.

        element.appendChild(li);     // append li to ul.
        
    }*/
    
}

function drawProfile() {
   var div = document.getElementById('profile');
  profile.drawProfile(div);
  
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
    
   // console.log("slider:"+showSliderValue)
    
    showSliderStartTime = time - 1
    
    cyclists[_debug_item].sendMessage('acelera#'+showSliderValue);

    return false;
}

function maxPowerUpdate(value) {
  
}

function powerSliderMouseClicked() {
    showPowerSliderValue = powerSlider.value();

   // console.log("powerSlider:" + showPowerSliderValue)

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