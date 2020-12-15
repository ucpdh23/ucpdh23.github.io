class stress {
  constructor(cyclist) {
    this.cyclist = cyclist;
    this.energy = cyclist.energy;
    this.level = (this.energy.llano +
                this.energy.montana +
                this.energy.estadoForma)/3;
  }
  
  update() {
    
  }
}