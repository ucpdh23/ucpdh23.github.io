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
    
    if (leader.energy.llano > 80
        && leader.energy.montana > 80) {
      this.strategy = 1;
      this.leader = leader;
      
      this.buildStrategy1();
    } else {
      this.cyclists.forEach(item => {
        if (item.energy.llano > 75 
          && item.energy.montana > 85
          && item.energy.estadoForma > 95) {
          this.buildStrategy2(item);
        }
      });
    }
  }
  
  buildStrategy2(item) {
    console.log(''+item.number+' debe saltar')
    item.addAction({
      from: 2000,
      to: 3000,
      prob: 90,
      action: 'avanza',
      payload: 90
    })
    item.addAction({
      from: 18050,
      to: 30250,
      prob: 85,
      action: 'salta',
      payload:''
    });
  }
  
  buildStrategy1() {
    console.log('team ' + this.id);
    console.log(' leader.number '+ this.leader.number);
    
    this.montana=this.cyclists.slice(0);
    this.llano=this.cyclists.slice(0);
    
    this.montana.sort((a,b) => {
      return - a.energy.montana + b.energy.montana
    });
    
    this.llano.sort((a,b)=> {
      return - a.energy.llano + b.energy.llano
    })
    
    var leaderMont = this.montana.indexOf(this.leader);
    var leaderLlano = this.llano.indexOf(this.leader);
    
    this.montana.splice(leaderMont, 1);
    this.llano.splice(leaderLlano, 1);
    
    this.escolta = this.montana[0];
    
    console.log('im the ' + leaderMont);
    for (var i = 0; i < 3; i++){
      var index = this.llano.indexOf(this.montana[i]);
      this.llano.splice(index, 1);
    }
    
    this.llano[2].addAction({
      from: 0,
      to: 500,
      prob: 90,
      action: 'tira',
      payload: 65
    });
    this.llano[2].addAction({
      from: 2500,
      prob: 100,
      action: 'no_tira',
      payload: 80
    });
    this.llano[1].addAction({
      from: 100,
      to: 500,
      prob: 90,
      action: 'avanza',
      payload: 80
    });
    this.llano[1].addAction({
      from: 2500,
      to: 3000,
      prob: 90,
      action: 'tira',
      payload: 70
    });
    this.leader.addAction({
      from: 1500,
      to: 2000,
      prob: 75,
      action: 'avanza',
      payload: 80
    });
    this.escolta.addAction({
      from: 200,
      to: 250,
      prob: 85,
      action: 'protege',
      payload: this.leader.id
    });
  }
  
  update() {
    if (this.strategy==1) {
      if (Math.random() < 0.001) {
        let diff = globalFirst.position.x - this.leader.position.x;
        if (diff > 15) {
          this.leader.sendMessage('acelera#1');
        }
      } else {
        if (this.leader.slope > 0) {
          
        }
      }
      
      
    }
  }
}