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

function incrementalUpdate(actual, expected, step=1) {
        
        if (Math.abs(actual - expected) < step*2)
          return expected;
        else if (actual < expected)
          return actual + step;
        else
          return actual - step;
}