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