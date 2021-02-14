const j = require("jsondiffpatch");

class DocStore {
  constructor() {
    this.store = this.createStore();
  }

  createStore() {
    let initialState = {
      blocks: [{ text: "" }],
      entityMap: {},
    };
    let state = { ...initialState };
    let users = {};
    return {
      initialState,
      getState: () => state,
      patch: (diff) => {
        state = j.patch(state, diff);
      },
    };
  }

  onJoinCheck() {
    return this.calcDelta(this.store.initialState, this.store.getState());
  }

  calcDelta(initial, current) {
    return j.diff(initial, current);
  }

  checkDiff(incomingData) {
    let { raw } = JSON.parse(incomingData);
    let delta = this.calcDelta(this.store.getState(), raw);

    if (delta) {
      this.store.patch(delta);
      return delta;
    }

    return undefined;
  }
}

module.exports = DocStore;
