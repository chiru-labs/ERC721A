/**
 * Obliterator Chain Function
 * ===========================
 *
 * Variadic function combining the given iterables.
 */
var Iterator = require('./iterator.js'),
  iter = require('./iter.js');

/**
 * Chain.
 *
 * @param  {...Iterator} iterables - Target iterables.
 * @return {Iterator}
 */
module.exports = function chain() {
  var iterables = arguments;
  var current = null;
  var i = -1;

  return new Iterator(function iterate() {
    if (current === null) {
      i++;

      if (i >= iterables.length) return {done: true};

      current = iter(iterables[i]);
    }

    var step = current.next();

    if (step.done) {
      current = null;
      return iterate();
    }

    return step;
  });
};
