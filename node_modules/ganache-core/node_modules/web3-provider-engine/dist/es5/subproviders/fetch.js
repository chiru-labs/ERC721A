'use strict';

var fetch = require('cross-fetch');
var inherits = require('util').inherits;
var retry = require('async/retry');
var waterfall = require('async/waterfall');
var asyncify = require('async/asyncify');
var JsonRpcError = require('json-rpc-error');
var promiseToCallback = require('promise-to-callback');
var createPayload = require('../util/create-payload.js');
var Subprovider = require('./subprovider.js');

var RETRIABLE_ERRORS = [
// ignore server overload errors
'Gateway timeout', 'ETIMEDOUT',
// ignore server sent html error pages
// or truncated json responses
'SyntaxError'];

module.exports = RpcSource;

inherits(RpcSource, Subprovider);

function RpcSource(opts) {
  var self = this;
  self.rpcUrl = opts.rpcUrl;
  self.originHttpHeaderKey = opts.originHttpHeaderKey;
}

RpcSource.prototype.handleRequest = function (payload, next, end) {
  var self = this;
  var originDomain = payload.origin;

  // overwrite id to not conflict with other concurrent users
  var newPayload = createPayload(payload);
  // remove extra parameter from request
  delete newPayload.origin;

  var reqParams = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPayload)
  };

  if (self.originHttpHeaderKey && originDomain) {
    reqParams.headers[self.originHttpHeaderKey] = originDomain;
  }

  retry({
    times: 5,
    interval: 1000,
    errorFilter: isErrorRetriable
  }, function (cb) {
    return self._submitRequest(reqParams, cb);
  }, function (err, result) {
    // ends on retriable error
    if (err && isErrorRetriable(err)) {
      var errMsg = 'FetchSubprovider - cannot complete request. All retries exhausted.\nOriginal Error:\n' + err.toString() + '\n\n';
      var retriesExhaustedErr = new Error(errMsg);
      return end(retriesExhaustedErr);
    }
    // otherwise continue normally
    return end(err, result);
  });
};

RpcSource.prototype._submitRequest = function (reqParams, cb) {
  var self = this;
  var targetUrl = self.rpcUrl;

  promiseToCallback(fetch(targetUrl, reqParams))(function (err, res) {
    if (err) return cb(err);

    // continue parsing result
    waterfall([checkForHttpErrors,
    // buffer body
    function (cb) {
      return promiseToCallback(res.text())(cb);
    },
    // parse body
    asyncify(function (rawBody) {
      return JSON.parse(rawBody);
    }), parseResponse], cb);

    function checkForHttpErrors(cb) {
      // check for errors
      switch (res.status) {
        case 405:
          return cb(new JsonRpcError.MethodNotFound());

        case 418:
          return cb(createRatelimitError());

        case 503:
        case 504:
          return cb(createTimeoutError());

        default:
          return cb();
      }
    }

    function parseResponse(body, cb) {
      // check for error code
      if (res.status !== 200) {
        return cb(new JsonRpcError.InternalError(body));
      }
      // check for rpc error
      if (body.error) return cb(new JsonRpcError.InternalError(body.error));
      // return successful result
      cb(null, body.result);
    }
  });
};

function isErrorRetriable(err) {
  var errMsg = err.toString();
  return RETRIABLE_ERRORS.some(function (phrase) {
    return errMsg.includes(phrase);
  });
}

function createRatelimitError() {
  var msg = 'Request is being rate limited.';
  var err = new Error(msg);
  return new JsonRpcError.InternalError(err);
}

function createTimeoutError() {
  var msg = 'Gateway timeout. The request took too long to process. ';
  msg += 'This can happen when querying logs over too wide a block range.';
  var err = new Error(msg);
  return new JsonRpcError.InternalError(err);
}