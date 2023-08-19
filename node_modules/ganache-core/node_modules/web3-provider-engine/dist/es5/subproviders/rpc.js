'use strict';

var xhr = process.browser ? require('xhr') : require('request');
var inherits = require('util').inherits;
var createPayload = require('../util/create-payload.js');
var Subprovider = require('./subprovider.js');
var JsonRpcError = require('json-rpc-error');

module.exports = RpcSource;

inherits(RpcSource, Subprovider);

function RpcSource(opts) {
  var self = this;
  self.rpcUrl = opts.rpcUrl;
}

RpcSource.prototype.handleRequest = function (payload, next, end) {
  var self = this;
  var targetUrl = self.rpcUrl;

  // overwrite id to conflict with other concurrent users
  var newPayload = createPayload(payload);

  xhr({
    uri: targetUrl,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPayload),
    rejectUnauthorized: false,
    timeout: 20000
  }, function (err, res, body) {
    if (err) return end(new JsonRpcError.InternalError(err));

    // check for error code
    switch (res.statusCode) {
      case 405:
        return end(new JsonRpcError.MethodNotFound());
      case 504:
        // Gateway timeout
        return function () {
          var msg = 'Gateway timeout. The request took too long to process. ';
          msg += 'This can happen when querying logs over too wide a block range.';
          var err = new Error(msg);
          return end(new JsonRpcError.InternalError(err));
        }();
      default:
        if (res.statusCode != 200) {
          return end(new JsonRpcError.InternalError(res.body));
        }
    }

    // parse response
    var data = void 0;
    try {
      data = JSON.parse(body);
    } catch (err) {
      console.error(err.stack);
      return end(new JsonRpcError.InternalError(err));
    }
    if (data.error) return end(data.error);

    end(null, data.result);
  });
};