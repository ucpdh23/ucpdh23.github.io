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
    if (leader.llano > 80 && leader.montana > 80) {
      this.strategy = 1;
    }
  }
  
  update() {
    
  }
}