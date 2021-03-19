class Team {
  static _id = 0;
  
  constructor() {
    this.cyclists =[];
    this.strategy = 0;
    this.id = Team._id++;
  }
  
  addCyclist(item) {
    this.cyclists.push(item);
  }
  
  build(profile) {
    let leader = this.cyclists[0];
    if (this.id == 0) return;
    
    if (leader.energy.llano > 80 && leader.energy.montana > 80) {
      this.strategy = 1;
      this.leader = leader;
      
      this.buildStrategy1();
    } else {
      this.cyclists.forEach(item => {
        if (item.energy.llano > 75 && item.energy.montana>82) {
          this.buildStrategy2(item);
        }
      });
    }
  }
  
  buildStrategy2(item) {
    
  }
  
  buildStrategy1() {
    console.log('team ' + this.id);
    console.log(' leader.number '+ this.leader.number);
    
    this.montana=this.cyclists.slice(0);
    this.llano=this.cyclists.slice(0);
    
    this.montana.sort((a,b) => {
      return a.energy.montana - b.energy.montana
    });
    
    this.llano.sort((a,b)=> {
      return a.energy.llano - b.energy.llano
    })
    
    var leaderMont = this.montana.indexOf(this.leader);
    
    console.log('im the ' + leaderMont);
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