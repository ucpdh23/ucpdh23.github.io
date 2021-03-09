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
  }
}