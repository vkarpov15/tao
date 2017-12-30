module.exports = Action;

function Action(obj) {
  Object.assign(this, obj);
}

Object.defineProperty(Action.prototype, 'promise', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: null
});
