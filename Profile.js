class Profile {
  etapa = [0, 2, 4, 7, 2, -3, -5, -5, -3, 0, 0, 0, 0, 4, 5, 7, 8, 6, 7, 8, 9, 10, -3, -6,-6,-6,-7,-2, -5,-7,-9,-2,0,0,0,0,0,4,0,6,7,12,15,3];
  
  //etapa = [0,5,11,11,11,11,12,13,14,15,16,17,18,19,20]
  data = [];
  
  segment = 2500;
  
 // etapa = [0,0,0,0,0,0,0,0,0,0]
  
  portInfos = [];
  
  percentColorsProfile = [
    { pct: 0.0, color: { r: 0x00, g: 0x00, b: 0xff } },
    { pct: 0.5, color: { r: 0x00, g: 0xff, b: 0 } },
    { pct: 0.75, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0x00, b: 0 } } ];
  
  constructor() {
    var prevSlope = 0;
    var port = 0;
    
    var elevation = 0;
    var dist = 0;
    
    
    this.data.push(
      {
        x: dist,
        y: elevation
      }
    );
    
    var portInfo = null;
    for (var i=0;i<this.etapa.length;i++) {
      var slope = this.etapa[i];
      dist += this.segment;
      elevation += slope * this.segment / 100;
      this.data.push({x: dist, y: elevation})
      
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
    //totalDistance = Math.round(data[data.length - 1].x);
    var totalDistance = this.etapa.length * this.segment;
    
    let elevGain = this.data.reduce((acc, cur, idx, arr) => {
      if (idx > 0 && (cur.y > arr[idx - 1].y)) {
        acc += cur.y - arr[idx - 1].y;
      }
      return acc;
    }, 0);
    elevGain = Math.round(elevGain * 3.28084);

    const chartMargins = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };
    const chartWidth = 200;
    const chartHeight = 100;
    const width = chartWidth - chartMargins.right - chartMargins.left;
    const height = chartHeight - chartMargins.top - chartMargins.bottom;

    const svg = d3.select('#idStage').append('svg')
      .attr('width', '100%') //chartWidth)
      .attr('height', '100%'); //chartHeight);
    //const svg = profile;
    this.svg = svg;

    const g = svg.append('g')
      .attr('transform', "translate(" + chartMargins.left + "," + chartMargins.top + ")");

    const xScale = d3.scaleLinear()
      .range([0, width])
     // .domain(d3.extent(data, d => d.x));
     .domain([0, this.etapa.length * this.segment])
     this.xScale = xScale;

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(this.data, d => d.y));

    const areaFn = d3.area()
      .x(d => xScale(d.x))
      .y0(yScale(d3.min(this.data, d => d.y)))
      .y1(d => yScale(d.y))
    	.curve(d3.curveBasis);

    g.append('path')
      .datum(this.data)
      //.attr('fill', 'steelblue')
      .attr('fill', 'red')
      .attr('d', areaFn);

    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
     /* .append('text')
        .attr('fill', '#333')
        .attr('y', 35)
    		.attr('x', width / 2)
        .text('Distance in miles')*/;

  /*  g.append('g')
        .call(d3.axisLeft(yScale))
      .append('text')
        .attr('fill', '#333')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35)
    		.attr('x', -height / 2)
        .attr('text-anchor', 'end')
        .text('Height, in feet');*/
    
    // label for total distance
   /* g.append('g')
      .append('text')
        .classed('heading', true)
        .attr('y', height + 35)
        .attr('x', 0)
    		.attr('font-family', 'sans-serif')
        .text('Total distance:')
      .append('tspan')
        .text(` ${totalDistance} mi`);*/

    // label for total elevation gain
   /* g.append('g')
      .append('text')
        .classed('heading', true)
        .attr('y', height + 35)
        .attr('x', width)
       	.attr('font-family', 'sans-serif')
        .attr('text-anchor', 'end')
        .attr('startOffset', '100%')
        .text('Elevation gain:')
      .append('tspan')
        .text(` ${elevGain.toLocaleString()} ft`);*/
  }
  
  setCyclists(cyclists){
    this.cyclists = cyclists;
  }
  
  triangles = [];
  
  update(delta) {
    for (i=0; i < 7 && i < this.cyclists.length; i++) {
      if (this.triangles[i] == null) {
        var sym =  
d3.symbol().type(d3.symbolTriangle).size(25); 
        this.triangles[i] =this.svg.append('path');
    this.triangles[i].attr("d", sym)
    .attr("transform", function(d) { return "translate(" + 10 + "," + 10 + ")"; })
    .style("fill", "red");
      } else {
        const value =10+ this.xScale(this.cyclists[i].position.x);
      this.triangles[i].attr("transform", function(d) { return "translate(" + 
   // this.xScale(this.cyclists[i].position.x) 
    value
    + "," + 100 + ")"; });
      }
      
    }
  }
  
  __drawProfile(profile) {
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