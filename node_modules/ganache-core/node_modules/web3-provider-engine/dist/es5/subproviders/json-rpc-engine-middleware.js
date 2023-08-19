"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Subprovider = require('./subprovider.js'); // wraps a json-rpc-engine middleware in a subprovider interface


var JsonRpcEngineMiddlewareSubprovider =
/*#__PURE__*/
function (_Subprovider) {
  _inherits(JsonRpcEngineMiddlewareSubprovider, _Subprovider);

  // take a constructorFn to call once we have a reference to the engine
  function JsonRpcEngineMiddlewareSubprovider(constructorFn) {
    var _this;

    _classCallCheck(this, JsonRpcEngineMiddlewareSubprovider);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(JsonRpcEngineMiddlewareSubprovider).call(this));
    if (!constructorFn) throw new Error('JsonRpcEngineMiddlewareSubprovider - no constructorFn specified');
    _this._constructorFn = constructorFn;
    return _this;
  } // this is called once the subprovider has been added to the provider engine


  _createClass(JsonRpcEngineMiddlewareSubprovider, [{
    key: "setEngine",
    value: function setEngine(engine) {
      if (this.middleware) throw new Error('JsonRpcEngineMiddlewareSubprovider - subprovider added to engine twice');
      var blockTracker = engine._blockTracker;

      var middleware = this._constructorFn({
        engine: engine,
        provider: engine,
        blockTracker: blockTracker
      });

      if (!middleware) throw new Error('JsonRpcEngineMiddlewareSubprovider - _constructorFn did not return middleware');
      if (typeof middleware !== 'function') throw new Error('JsonRpcEngineMiddlewareSubprovider - specified middleware is not a function');
      this.middleware = middleware;
    }
  }, {
    key: "handleRequest",
    value: function handleRequest(req, provEngNext, provEngEnd) {
      var res = {
        id: req.id
      };
      this.middleware(req, res, middlewareNext, middlewareEnd);

      function middlewareNext(handler) {
        provEngNext(function (err, result, cb) {
          // update response object with result or error
          if (err) {
            delete res.result;
            res.error = {
              message: err.message || err
            };
          } else {
            res.result = result;
          } // call middleware's next handler (even if error)


          if (handler) {
            handler(cb);
          } else {
            cb();
          }
        });
      }

      function middlewareEnd(err) {
        if (err) return provEngEnd(err);
        provEngEnd(null, res.result);
      }
    }
  }]);

  return JsonRpcEngineMiddlewareSubprovider;
}(Subprovider);

module.exports = JsonRpcEngineMiddlewareSubprovider;