import mitt from "mitt";

export class EmitterBaseClass {
  emitter: any;
  constructor() {
    this.emitter = mitt();
  }

  addEventListener(event, handler) {
    this.emitter.on.apply(this, [event, handler]);
  }

  removeEventListener(event, handler) {
    if (this.emitter) {
      this.emitter.off.apply(this, [event, handler]);
    }
  }

  emit(event, data?) {
    if (this.emitter) {
      this.emitter.emit.apply(this, [event, data]);
    }
  }
}
