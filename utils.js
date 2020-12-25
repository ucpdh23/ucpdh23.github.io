function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function dec(num, mul){
  return ""+((int)(num*mul))/mul;
}

function findCyclist(id) {
    for (var i = 0; i < cyclists.length; i++) {
        if (cyclists[i].id === id) {
            return cyclists[i];
        }
    }

    return null;
}

function rgbToHex(rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

function strTime(time){
  var mins = (int)(time / 60);
  var secs = (int)(time) % 60;
  
  return pad(mins, 2) + ":" + pad(secs, 2);
}

function getColorForPercentage(pct, percentColors) {
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


function incrementalUpdate(actual, expected, step=1) {
        
        if (Math.abs(actual - expected) < step*2)
          return expected;
        else if (actual < expected)
          return actual + step;
        else
          return actual - step;
}