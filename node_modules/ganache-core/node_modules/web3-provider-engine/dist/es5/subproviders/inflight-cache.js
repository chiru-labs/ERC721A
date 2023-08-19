'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cacheIdentifierForPayload = require('../util/rpc-cache-utils.js').cacheIdentifierForPayload;
var Subprovider = require('./subprovider.js');
var clone = require('clone');

var InflightCacheSubprovider = function (_Subprovider) {
  _inherits(InflightCacheSubprovider, _Subprovider);

  function InflightCacheSubprovider(opts) {
    _classCallCheck(this, InflightCacheSubprovider);

    var _this = _possibleConstructorReturn(this, (InflightCacheSubprovider.__proto__ || Object.getPrototypeOf(InflightCacheSubprovider)).call(this));

    _this.inflightRequests = {};
    return _this;
  }

  _createClass(InflightCacheSubprovider, [{
    key: 'addEngine',
    value: function addEngine(engine) {
      this.engine = engine;
    }
  }, {
    key: 'handleRequest',
    value: function handleRequest(req, next, end) {
      var _this2 = this;

      var cacheId = cacheIdentifierForPayload(req, { includeBlockRef: true });

      // if not cacheable, skip
      if (!cacheId) return next();

      // check for matching requests
      var activeRequestHandlers = this.inflightRequests[cacheId];

      if (!activeRequestHandlers) {
        // create inflight cache for cacheId
        activeRequestHandlers = [];
        this.inflightRequests[cacheId] = activeRequestHandlers;

        next(function (err, result, cb) {
          // complete inflight for cacheId
          delete _this2.inflightRequests[cacheId];
          activeRequestHandlers.forEach(function (handler) {
            return handler(err, clone(result));
          });
          cb(err, result);
        });
      } else {
        // hit inflight cache for cacheId
        // setup the response listener
        activeRequestHandlers.push(end);
      }
    }
  }]);

  return InflightCacheSubprovider;
}(Subprovider);

module.exports = InflightCacheSubprovider;