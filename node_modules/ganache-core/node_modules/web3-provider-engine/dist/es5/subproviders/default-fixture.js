'use strict';

var inherits = require('util').inherits;
var extend = require('xtend');
var FixtureProvider = require('./fixture.js');
var version = require('../package.json').version;

module.exports = DefaultFixtures;

inherits(DefaultFixtures, FixtureProvider);

function DefaultFixtures(opts) {
  var self = this;
  opts = opts || {};
  var responses = extend({
    web3_clientVersion: 'ProviderEngine/v' + version + '/javascript',
    net_listening: true,
    eth_hashrate: '0x00',
    eth_mining: false
  }, opts);
  FixtureProvider.call(self, responses);
}