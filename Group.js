class Group {
  cyclists = [];
  cyclistsId = [];
  
  constructor() {
    //console.log('newGroup')
  }
  
  addCyclist(cyclist){
    this.cyclists.push(cyclist);
    this.cyclistsId.push(cyclist.id);
    
    cyclist.group = this;
  }
  
  indexOf(id){
    return this.cyclistsId.indexOf(id);
  }
  
  getFirst(){
   // console.log(this.cyclists[0])
    return this.cyclists[0];
  }
}