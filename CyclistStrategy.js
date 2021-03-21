Cyclist.prototype.addAction=function(json){
  let from = json.from;
  let to = json.to;
  let prob = json.prob;
  let action = json.action;
  let payload = json.payload;
  
  this.actions[from]=json;
  this.actionMeters.push((int)(from));
  this.actionMeters.sort();
}

Cyclist.prototype.checkAction=function(meters){
  
  if (this.actionMeters.length > 0 &&
    this.actionMeters[0] < meters) {
      this.proceedAction(this.actionMeters[0]);
      this.actionMeters.shift();
    }
}

Cyclist.prototype.proceedAction=function(meters) {
  if ((int)(meters) in this.actions) {
    let json = this.actions[(int)(meters)];
    if (json.enabled == false) return;
    
    json.enabled=false;
    
    let prob = Math.random()*100;
    console.log('prob'+ prob)
    if (json.prob >= prob) {
      if (json.from){
        var location = json.from;
        if (json.to != null && json.to != json.from) {
          let delta = Math.random();
          let distance = json.to - json.from;
          location=json.from+distance*delta;
        }
        console.log('location'+ location)
        if ((int)(location)==(int)(meters)){
          this.runAction(json);
        } else {
          this.addAction({
            from: (int)(location),
            prob: 100,
            action: json.action,
            payload: json.payload
          });
        }
      } else {
        this.runAction(json);
      }
    }
  }
} 

Cyclist.prototype.runAction=function(json){
  console.log('sendmessage'+json.action)
  this.sendMessage(json.action, json.payload);
}