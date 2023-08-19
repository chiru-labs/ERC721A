'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Backoff = require('backoff');
var EventEmitter = require('events');
var inherits = require('util').inherits;
var WebSocket = global.WebSocket || require('ws');
var Subprovider = require('./subprovider');
var createPayload = require('../util/create-payload');

var WebsocketSubprovider = function (_Subprovider) {
  _inherits(WebsocketSubprovider, _Subprovider);

  function WebsocketSubprovider(_ref) {
    var rpcUrl = _ref.rpcUrl,
        debug = _ref.debug,
        origin = _ref.origin;

    _classCallCheck(this, WebsocketSubprovider);

    // inherit from EventEmitter
    var _this = _possibleConstructorReturn(this, (WebsocketSubprovider.__proto__ || Object.getPrototypeOf(WebsocketSubprovider)).call(this));

    EventEmitter.call(_this);

    Object.defineProperties(_this, {
      _backoff: {
        value: Backoff.exponential({
          randomisationFactor: 0.2,
          maxDelay: 5000
        })
      },
      _connectTime: {
        value: null,
        writable: true
      },
      _log: {
        value: debug ? function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return console.info.apply(console, ['[WSProvider]'].concat(args));
        } : function () {}
      },
      _origin: {
        value: origin
      },
      _pendingRequests: {
        value: new Map()
      },
      _socket: {
        value: null,
        writable: true
      },
      _unhandledRequests: {
        value: []
      },
      _url: {
        value: rpcUrl
      }
    });

    _this._handleSocketClose = _this._handleSocketClose.bind(_this);
    _this._handleSocketMessage = _this._handleSocketMessage.bind(_this);
    _this._handleSocketOpen = _this._handleSocketOpen.bind(_this);

    // Called when a backoff timeout has finished. Time to try reconnecting.
    _this._backoff.on('ready', function () {
      _this._openSocket();
    });

    _this._openSocket();
    return _this;
  }

  _createClass(WebsocketSubprovider, [{
    key: 'handleRequest',
    value: function handleRequest(payload, next, end) {
      if (!this._socket || this._socket.readyState !== WebSocket.OPEN) {
        this._unhandledRequests.push(Array.from(arguments));
        this._log('Socket not open. Request queued.');
        return;
      }

      this._pendingRequests.set(payload.id, [payload, end]);

      var newPayload = createPayload(payload);
      delete newPayload.origin;

      this._socket.send(JSON.stringify(newPayload));
      this._log('Sent: ' + newPayload.method + ' #' + newPayload.id);
    }
  }, {
    key: '_handleSocketClose',
    value: function _handleSocketClose(_ref2) {
      var reason = _ref2.reason,
          code = _ref2.code;

      this._log('Socket closed, code ' + code + ' (' + (reason || 'no reason') + ')');
      // If the socket has been open for longer than 5 seconds, reset the backoff
      if (this._connectTime && Date.now() - this._connectTime > 5000) {
        this._backoff.reset();
      }

      this._socket.removeEventListener('close', this._handleSocketClose);
      this._socket.removeEventListener('message', this._handleSocketMessage);
      this._socket.removeEventListener('open', this._handleSocketOpen);

      this._socket = null;
      this._backoff.backoff();
    }
  }, {
    key: '_handleSocketMessage',
    value: function _handleSocketMessage(message) {
      var payload = void 0;

      try {
        payload = JSON.parse(message.data);
      } catch (e) {
        this._log('Received a message that is not valid JSON:', payload);
        return;
      }

      // check if server-sent notification
      if (payload.id === undefined) {
        return this.emit('data', null, payload);
      }

      // ignore if missing
      if (!this._pendingRequests.has(payload.id)) {
        return;
      }

      // retrieve payload + arguments

      var _pendingRequests$get = this._pendingRequests.get(payload.id),
          _pendingRequests$get2 = _slicedToArray(_pendingRequests$get, 2),
          originalReq = _pendingRequests$get2[0],
          end = _pendingRequests$get2[1];

      this._pendingRequests.delete(payload.id);

      this._log('Received: ' + originalReq.method + ' #' + payload.id);

      // forward response
      if (payload.error) {
        return end(new Error(payload.error.message));
      }
      end(null, payload.result);
    }
  }, {
    key: '_handleSocketOpen',
    value: function _handleSocketOpen() {
      var _this2 = this;

      this._log('Socket open.');
      this._connectTime = Date.now();

      // Any pending requests need to be resent because our session was lost
      // and will not get responses for them in our new session.
      this._pendingRequests.forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            payload = _ref4[0],
            end = _ref4[1];

        _this2._unhandledRequests.push([payload, null, end]);
      });
      this._pendingRequests.clear();

      var unhandledRequests = this._unhandledRequests.splice(0, this._unhandledRequests.length);
      unhandledRequests.forEach(function (request) {
        _this2.handleRequest.apply(_this2, request);
      });
    }
  }, {
    key: '_openSocket',
    value: function _openSocket() {
      this._log('Opening socket...');
      this._socket = new WebSocket(this._url, [], this._origin ? { headers: { origin: this._origin } } : {});
      this._socket.addEventListener('close', this._handleSocketClose);
      this._socket.addEventListener('message', this._handleSocketMessage);
      this._socket.addEventListener('open', this._handleSocketOpen);
    }
  }]);

  return WebsocketSubprovider;
}(Subprovider);

// multiple inheritance


Object.assign(WebsocketSubprovider.prototype, EventEmitter.prototype);

module.exports = WebsocketSubprovider;