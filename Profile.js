class Profile {
  etapa = [0, 2, 4, 7, 2, -3, -5, -5, -3, 0, 0, 0, 0, 4, 5, 7, 8, 6, 7, 8, 9, 10, -3, -6,-6,-6,-7,-2, -5,-7,-9,-2,0,0,0,0,0,4,0,6,7,12,15,3];
  
  segment = 1000;
  
  //etapa = [0,0,0,0,0,0,0,0,0,0]
  
  portInfos = [];
  
  percentColorsProfile = [
    { pct: 0.0, color: { r: 0x00, g: 0x00, b: 0xff } },
    { pct: 0.5, color: { r: 0x00, g: 0xff, b: 0 } },
    { pct: 0.75, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0x00, b: 0 } } ];
  
  constructor() {
    var prevSlope = 0;
    var port = 0;
    
    var portInfo = null;
    for (var i=0;i<this.etapa.length;i++) {
      var slope = this.etapa[i];
      
      if (prevSlope == 0 && slope > 0 && portInfo == null) {
        this.addListener(i*this.segment, (cyclist, portNumber) => {
          cyclist.sendMessage('startPort', this.portInfos[portNumber]);
        }, port);
        
        portInfo = {
          id: port,
          kms: 0,
          slope: 0
        };
        
        
      } else if (prevSlope > 0 && slope < 0) {
        this.addListener(i*this.segment, (cyclist, portNumber) => {
          cyclist.sendMessage('endPort', this.portInfos[portNumber]);
        }, port);
        
        portInfo.slope = portInfo.slope / portInfo.kms;
        
        this.portInfos.push(portInfo);
        
        portInfo = null;
        
        port++;
      }
      
      if (portInfo != null) {
        portInfo.kms += this.segment / 1000;
        portInfo.slope += slope*this.segment/1000;
      }
      
      prevSlope = slope;
    }
    
    if (portInfo != null) {
      this.addListener(this.etapa.length *this.segment, (cyclist, portNumber) => {
          cyclist.sendMessage('endPort', this.portInfos[portNumber]);
        }, port);
        
        portInfo.slope = portInfo.slope / portInfo.kms;
        
        this.portInfos.push(portInfo);
    }
  }
  
  listeners = {};
  listenersPort = {}
  addListener(meters, listener, portNumber) {
    this.listeners[meters] = listener;
    this.listenersPort[meters] = portNumber;
  }
  
  events = {};
  onEvent(cyclist) {
    if (this.events[cyclist.id] == null) {
      this.events[cyclist.id] = Object.keys( this.listeners);
    }
    
    if (this.events[cyclist.id].length == 0) return;
    
    var kms = this.events[cyclist.id][0];
    if (kms < cyclist.position.x) {
      this.listeners[kms].apply(this, [cyclist, this.listenersPort[kms]]);
      this.events[cyclist.id].shift();
    }
  }
  
  drawProfile(profile) {
  var offset = 10;
  var offsetY = 200;
  var elevation = 0;
  for (var i=0;i<this.etapa.length;i++) {
    var desn = this.etapa[i];
  var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine.setAttribute('id', 'line'+ i);
  newLine.setAttribute('x1', ''+(offset + i*
  15));
  newLine.setAttribute('y1', '' + (200 - elevation));
  newLine.setAttribute('x2', ''+(offset +(i+1)*15));
  elevation = elevation + desn * 5;
  newLine.setAttribute('y2', '' +(200 - elevation));
  var percent = (desn + 30) / 60;
  var color = getColorForPercentage(
    percent,
    this.percentColorsProfile)
  var colorCode = '#' + rgbToHex(color.r) + rgbToHex(color.g) + rgbToHex(color.b);
  newLine.setAttribute("stroke", colorCode);
  newLine.setAttribute("stroke-width", 2);
  
  profile.append(newLine);
  }
  var kms = this.etapa.length*this.segment/ 1000;
  
 var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
 text.setAttribute("x", 10);
 text.setAttribute("y", 10);
 text.setAttribute("font-size", 30)
 text.textContent=''+kms+'kms'
 
 profile.append(text);
}

computeEnvironment(cyclist) {
  this.onEvent(cyclist);
  
  return this.computeEnvironmentByPos(
    cyclist.position.x);
}

computeEnvironmentByPos(pos) {
  var computeSlope=this.computeSlope(pos);
  
  var computeWidth = computeSlope == 0?
    8 : 4;
  
  return {
   slope: computeSlope,
   width: computeWidth
  };
}


computeSlope(position) {
    var index = (int)(position/this.segment);

    if (index < this.etapa.length) {
        return this.etapa[index];
    } else {
        return 0;
    }
  }
}