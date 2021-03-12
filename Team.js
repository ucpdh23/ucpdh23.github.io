class Team {
  constructor() {
    this.cyclists =[];
    this.strategy = 0;
  }
  
  addCyclist(item) {
    this.cyclists.push(item);
  }
  
  build(profile) {
    let leader = this.cyclists[0];
    if (leader.number < 10) return;
    
    if (leader.energy.llano > 75 && leader.energy.montana > 80) {
      this.strategy = 1;
      this.leader = leader;
    }
    
    
  }
  
  update() {
    if (this.strategy==1) {
      if (Math.random() < 0.001) {
        let diff = globalFirst.position.x - this.leader.position.x;
        if (diff > 15) {
          this.leader.sendMessage('acelera#'+2);
        }
      } else {
        if (this.leader.slope > 0) {
          
        }
      }
      
      
    }
  }
}