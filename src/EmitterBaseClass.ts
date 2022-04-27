import mitt, { Emitter } from "mitt";

export class EmitterBaseClass {
  emitter: Emitter;
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

  clear() {
    this.emitter.all.clear();
  }

  emit(event, data?) {
    if (this.emitter) {
      this.emitter.emit.apply(this, [event, data]);
    }
  }

  destroy() {
    this.emitter.all.clear();
    this.emitter = null;
  }
}
