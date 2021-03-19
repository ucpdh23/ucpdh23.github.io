class Group {
  cyclists = [];
  
  constructor() {
    //console.log('newGroup')
  }
  
  addCyclist(cyclist){
    this.cyclists.push(cyclist);
    cyclist.group = this;
  }
  
  getFirst(){
   // console.log(this.cyclists[0])
    return this.cyclists[0];
  }
}