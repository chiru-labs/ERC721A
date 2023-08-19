'use strict';

var inherits = require('util').inherits;
var Subprovider = require('./subprovider.js');

module.exports = FixtureProvider;

inherits(FixtureProvider, Subprovider);

function FixtureProvider(staticResponses) {
  var self = this;
  staticResponses = staticResponses || {};
  self.staticResponses = staticResponses;
}

FixtureProvider.prototype.handleRequest = function (payload, next, end) {
  var self = this;
  var staticResponse = self.staticResponses[payload.method];
  // async function
  if ('function' === typeof staticResponse) {
    staticResponse(payload, next, end);
    // static response - null is valid response
  } else if (staticResponse !== undefined) {
    // return result asynchronously
    setTimeout(function () {
      return end(null, staticResponse);
    });
    // no prepared response - skip
  } else {
    next();
  }
};