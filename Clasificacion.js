class Clasificacion {
  constructor() {
    this.items = {};
  }
  register(cyclist, meters) {
    if (!(meters in this.items)) {
      this.items[meters]=[];
    }
    this.items[meters].push(
      {
        timestamp: time,
        cyclist: cyclist
      }
    );
    
    let list = this.items[meters];
    length = list.length;
    if (length == 1) {
      var first = list[0];
      console.log("" + first.cyclist.number +":"+strTime(first.timestamp));
    } else {
      var first = list[0];
      var last = list[length-1];
      console.log(''+ last.cyclist.number + ' a '+ strTime(last.timestamp - first.timestamp));
    }
      
  }
}