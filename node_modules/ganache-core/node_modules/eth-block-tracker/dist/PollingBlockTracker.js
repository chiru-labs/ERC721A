(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PollingBlockTracker = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const extend = require('xtend')
const createRandomId = require('json-rpc-random-id')()

module.exports = EthQuery


function EthQuery(provider){
  const self = this
  self.currentProvider = provider
}

//
// base queries
//

// default block
EthQuery.prototype.getBalance =                          generateFnWithDefaultBlockFor(2, 'eth_getBalance')
EthQuery.prototype.getCode =                             generateFnWithDefaultBlockFor(2, 'eth_getCode')
EthQuery.prototype.getTransactionCount =                 generateFnWithDefaultBlockFor(2, 'eth_getTransactionCount')
EthQuery.prototype.getStorageAt =                        generateFnWithDefaultBlockFor(3, 'eth_getStorageAt')
EthQuery.prototype.call =                                generateFnWithDefaultBlockFor(2, 'eth_call')
// standard
EthQuery.prototype.protocolVersion =                     generateFnFor('eth_protocolVersion')
EthQuery.prototype.syncing =                             generateFnFor('eth_syncing')
EthQuery.prototype.coinbase =                            generateFnFor('eth_coinbase')
EthQuery.prototype.mining =                              generateFnFor('eth_mining')
EthQuery.prototype.hashrate =                            generateFnFor('eth_hashrate')
EthQuery.prototype.gasPrice =                            generateFnFor('eth_gasPrice')
EthQuery.prototype.accounts =                            generateFnFor('eth_accounts')
EthQuery.prototype.blockNumber =                         generateFnFor('eth_blockNumber')
EthQuery.prototype.getBlockTransactionCountByHash =      generateFnFor('eth_getBlockTransactionCountByHash')
EthQuery.prototype.getBlockTransactionCountByNumber =    generateFnFor('eth_getBlockTransactionCountByNumber')
EthQuery.prototype.getUncleCountByBlockHash =            generateFnFor('eth_getUncleCountByBlockHash')
EthQuery.prototype.getUncleCountByBlockNumber =          generateFnFor('eth_getUncleCountByBlockNumber')
EthQuery.prototype.sign =                                generateFnFor('eth_sign')
EthQuery.prototype.sendTransaction =                     generateFnFor('eth_sendTransaction')
EthQuery.prototype.sendRawTransaction =                  generateFnFor('eth_sendRawTransaction')
EthQuery.prototype.estimateGas =                         generateFnFor('eth_estimateGas')
EthQuery.prototype.getBlockByHash =                      generateFnFor('eth_getBlockByHash')
EthQuery.prototype.getBlockByNumber =                    generateFnFor('eth_getBlockByNumber')
EthQuery.prototype.getTransactionByHash =                generateFnFor('eth_getTransactionByHash')
EthQuery.prototype.getTransactionByBlockHashAndIndex =   generateFnFor('eth_getTransactionByBlockHashAndIndex')
EthQuery.prototype.getTransactionByBlockNumberAndIndex = generateFnFor('eth_getTransactionByBlockNumberAndIndex')
EthQuery.prototype.getTransactionReceipt =               generateFnFor('eth_getTransactionReceipt')
EthQuery.prototype.getUncleByBlockHashAndIndex =         generateFnFor('eth_getUncleByBlockHashAndIndex')
EthQuery.prototype.getUncleByBlockNumberAndIndex =       generateFnFor('eth_getUncleByBlockNumberAndIndex')
EthQuery.prototype.getCompilers =                        generateFnFor('eth_getCompilers')
EthQuery.prototype.compileLLL =                          generateFnFor('eth_compileLLL')
EthQuery.prototype.compileSolidity =                     generateFnFor('eth_compileSolidity')
EthQuery.prototype.compileSerpent =                      generateFnFor('eth_compileSerpent')
EthQuery.prototype.newFilter =                           generateFnFor('eth_newFilter')
EthQuery.prototype.newBlockFilter =                      generateFnFor('eth_newBlockFilter')
EthQuery.prototype.newPendingTransactionFilter =         generateFnFor('eth_newPendingTransactionFilter')
EthQuery.prototype.uninstallFilter =                     generateFnFor('eth_uninstallFilter')
EthQuery.prototype.getFilterChanges =                    generateFnFor('eth_getFilterChanges')
EthQuery.prototype.getFilterLogs =                       generateFnFor('eth_getFilterLogs')
EthQuery.prototype.getLogs =                             generateFnFor('eth_getLogs')
EthQuery.prototype.getWork =                             generateFnFor('eth_getWork')
EthQuery.prototype.submitWork =                          generateFnFor('eth_submitWork')
EthQuery.prototype.submitHashrate =                      generateFnFor('eth_submitHashrate')

// network level

EthQuery.prototype.sendAsync = function(opts, cb){
  const self = this
  self.currentProvider.sendAsync(createPayload(opts), function(err, response){
    if (!err && response.error) err = new Error('EthQuery - RPC Error - '+response.error.message)
    if (err) return cb(err)
    cb(null, response.result)
  })
}

// util

function generateFnFor(methodName){
  return function(){
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function generateFnWithDefaultBlockFor(argCount, methodName){
  return function(){
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    // set optional default block param
    if (args.length < argCount) args.push('latest')
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function createPayload(data){
  return extend({
    // defaults
    id: createRandomId(),
    jsonrpc: '2.0',
    params: [],
    // user-specified
  }, data)
}

},{"json-rpc-random-id":3,"xtend":5}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
module.exports = IdIterator

function IdIterator(opts){
  opts = opts || {}
  var max = opts.max || Number.MAX_SAFE_INTEGER
  var idCounter = typeof opts.start !== 'undefined' ? opts.start : Math.floor(Math.random() * max)

  return function createRandomId () {
    idCounter = idCounter % max
    return idCounter++
  }

}
},{}],4:[function(require,module,exports){
'use strict';

const processFn = (fn, opts) => function () {
	const P = opts.promiseModule;
	const args = new Array(arguments.length);

	for (let i = 0; i < arguments.length; i++) {
		args[i] = arguments[i];
	}

	return new P((resolve, reject) => {
		if (opts.errorFirst) {
			args.push(function (err, result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					if (err) {
						results.unshift(err);
						reject(results);
					} else {
						resolve(results);
					}
				} else if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			args.push(function (result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 0; i < arguments.length; i++) {
						results[i] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});
		}

		fn.apply(this, args);
	});
};

module.exports = (obj, opts) => {
	opts = Object.assign({
		exclude: [/.+(Sync|Stream)$/],
		errorFirst: true,
		promiseModule: Promise
	}, opts);

	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	let ret;
	if (typeof obj === 'function') {
		ret = function () {
			if (opts.excludeMain) {
				return obj.apply(this, arguments);
			}

			return processFn(obj, opts).apply(this, arguments);
		};
	} else {
		ret = Object.create(Object.getPrototypeOf(obj));
	}

	for (const key in obj) { // eslint-disable-line guard-for-in
		const x = obj[key];
		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, opts) : x;
	}

	return ret;
};

},{}],5:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EthQuery = require('eth-query');
var EventEmitter = require('events');
var pify = require('pify');

var sec = 1000;

var calculateSum = function calculateSum(accumulator, currentValue) {
  return accumulator + currentValue;
};
var blockTrackerEvents = ['sync', 'latest'];

var BaseBlockTracker = function (_EventEmitter) {
  _inherits(BaseBlockTracker, _EventEmitter);

  //
  // public
  //

  function BaseBlockTracker() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BaseBlockTracker);

    // config
    var _this = _possibleConstructorReturn(this, (BaseBlockTracker.__proto__ || Object.getPrototypeOf(BaseBlockTracker)).call(this));

    _this._blockResetDuration = opts.blockResetDuration || 20 * sec;
    // state
    _this._blockResetTimeout;
    _this._currentBlock = null;
    _this._isRunning = false;
    // bind functions for internal use
    _this._onNewListener = _this._onNewListener.bind(_this);
    _this._onRemoveListener = _this._onRemoveListener.bind(_this);
    _this._resetCurrentBlock = _this._resetCurrentBlock.bind(_this);
    // listen for handler changes
    _this._setupInternalEvents();
    return _this;
  }

  _createClass(BaseBlockTracker, [{
    key: 'isRunning',
    value: function isRunning() {
      return this._isRunning;
    }
  }, {
    key: 'getCurrentBlock',
    value: function getCurrentBlock() {
      return this._currentBlock;
    }
  }, {
    key: 'getLatestBlock',
    value: async function getLatestBlock() {
      var _this2 = this;

      // return if available
      if (this._currentBlock) return this._currentBlock;
      // wait for a new latest block
      var latestBlock = await new Promise(function (resolve) {
        return _this2.once('latest', resolve);
      });
      // return newly set current block
      return latestBlock;
    }

    // dont allow module consumer to remove our internal event listeners

  }, {
    key: 'removeAllListeners',
    value: function removeAllListeners(eventName) {
      // perform default behavior, preserve fn arity
      if (eventName) {
        _get(BaseBlockTracker.prototype.__proto__ || Object.getPrototypeOf(BaseBlockTracker.prototype), 'removeAllListeners', this).call(this, eventName);
      } else {
        _get(BaseBlockTracker.prototype.__proto__ || Object.getPrototypeOf(BaseBlockTracker.prototype), 'removeAllListeners', this).call(this);
      }
      // re-add internal events
      this._setupInternalEvents();
      // trigger stop check just in case
      this._onRemoveListener();
    }

    //
    // to be implemented in subclass
    //

  }, {
    key: '_start',
    value: function _start() {
      // default behavior is noop
    }
  }, {
    key: '_end',
    value: function _end() {}
    // default behavior is noop


    //
    // private
    //

  }, {
    key: '_setupInternalEvents',
    value: function _setupInternalEvents() {
      // first remove listeners for idempotence
      this.removeListener('newListener', this._onNewListener);
      this.removeListener('removeListener', this._onRemoveListener);
      // then add them
      this.on('newListener', this._onNewListener);
      this.on('removeListener', this._onRemoveListener);
    }
  }, {
    key: '_onNewListener',
    value: function _onNewListener(eventName, handler) {
      // `newListener` is called *before* the listener is added
      if (!blockTrackerEvents.includes(eventName)) return;
      this._maybeStart();
    }
  }, {
    key: '_onRemoveListener',
    value: function _onRemoveListener(eventName, handler) {
      // `removeListener` is called *after* the listener is removed
      if (this._getBlockTrackerEventCount() > 0) return;
      this._maybeEnd();
    }
  }, {
    key: '_maybeStart',
    value: function _maybeStart() {
      if (this._isRunning) return;
      this._isRunning = true;
      // cancel setting latest block to stale
      this._cancelBlockResetTimeout();
      this._start();
    }
  }, {
    key: '_maybeEnd',
    value: function _maybeEnd() {
      if (!this._isRunning) return;
      this._isRunning = false;
      this._setupBlockResetTimeout();
      this._end();
    }
  }, {
    key: '_getBlockTrackerEventCount',
    value: function _getBlockTrackerEventCount() {
      var _this3 = this;

      return blockTrackerEvents.map(function (eventName) {
        return _this3.listenerCount(eventName);
      }).reduce(calculateSum);
    }
  }, {
    key: '_newPotentialLatest',
    value: function _newPotentialLatest(newBlock) {
      var currentBlock = this._currentBlock;
      if (currentBlock && newBlock.hash === currentBlock.hash) return;
      this._setCurrentBlock(newBlock);
    }
  }, {
    key: '_setCurrentBlock',
    value: function _setCurrentBlock(newBlock) {
      var oldBlock = this._currentBlock;
      this._currentBlock = newBlock;
      this.emit('latest', newBlock);
      this.emit('sync', { oldBlock: oldBlock, newBlock: newBlock });
    }
  }, {
    key: '_setupBlockResetTimeout',
    value: function _setupBlockResetTimeout() {
      // clear any existing timeout
      this._cancelBlockResetTimeout();
      // clear latest block when stale
      this._blockResetTimeout = setTimeout(this._resetCurrentBlock, this._blockResetDuration);
      // nodejs - dont hold process open
      if (this._blockResetTimeout.unref) {
        this._blockResetTimeout.unref();
      }
    }
  }, {
    key: '_cancelBlockResetTimeout',
    value: function _cancelBlockResetTimeout() {
      clearTimeout(this._blockResetTimeout);
    }
  }, {
    key: '_resetCurrentBlock',
    value: function _resetCurrentBlock() {
      this._currentBlock = null;
    }
  }]);

  return BaseBlockTracker;
}(EventEmitter);

module.exports = BaseBlockTracker;

},{"eth-query":1,"events":2,"pify":4}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EthQuery = require('eth-query');
var EventEmitter = require('events');
var pify = require('pify');
var BaseBlockTracker = require('./base');
var timeout = function timeout(duration) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, duration);
  });
};

var sec = 1000;
var min = 60 * sec;

var PollingBlockTracker = function (_BaseBlockTracker) {
  _inherits(PollingBlockTracker, _BaseBlockTracker);

  function PollingBlockTracker() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PollingBlockTracker);

    // parse + validate args
    if (!opts.provider) throw new Error('PollingBlockTracker - no provider specified.');
    var pollingInterval = opts.pollingInterval || 20 * sec;
    // BaseBlockTracker constructor

    // config
    var _this = _possibleConstructorReturn(this, (PollingBlockTracker.__proto__ || Object.getPrototypeOf(PollingBlockTracker)).call(this, Object.assign({
      blockResetDuration: pollingInterval
    }, opts)));

    _this._provider = opts.provider;
    _this._pollingInterval = pollingInterval;
    // util
    _this._query = new EthQuery(_this._provider);
    return _this;
  }

  //
  // public
  //

  // trigger block polling


  _createClass(PollingBlockTracker, [{
    key: 'checkForLatestBlock',
    value: async function checkForLatestBlock() {
      await this._updateLatestBlock();
      return await this.getLatestBlock();
    }

    //
    // private
    //

  }, {
    key: '_start',
    value: function _start() {
      var _this2 = this;

      this._performSync().catch(function (err) {
        return _this2.emit('error', err);
      });
    }
  }, {
    key: '_performSync',
    value: async function _performSync() {
      while (this._isRunning) {
        try {
          await this._updateLatestBlock();
        } catch (err) {
          this.emit('error', err);
        }
        await timeout(this._pollingInterval);
      }
    }
  }, {
    key: '_updateLatestBlock',
    value: async function _updateLatestBlock() {
      // fetch + set latest block
      var latestBlock = await this._fetchLatestBlock();
      this._newPotentialLatest(latestBlock);
    }
  }, {
    key: '_fetchLatestBlock',
    value: async function _fetchLatestBlock() {
      return await pify(this._query.getBlockByNumber).call(this._query, 'latest', false);
    }
  }]);

  return PollingBlockTracker;
}(BaseBlockTracker);

module.exports = PollingBlockTracker;

},{"./base":6,"eth-query":1,"events":2,"pify":4}]},{},[7])(7)
});