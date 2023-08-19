'use strict';

var ProviderEngine = require('./index.js');
var DefaultFixture = require('./subproviders/default-fixture.js');
var NonceTrackerSubprovider = require('./subproviders/nonce-tracker.js');
var CacheSubprovider = require('./subproviders/cache.js');
var FilterSubprovider = require('./subproviders/filters.js');
var SubscriptionSubprovider = require('./subproviders/subscriptions');
var InflightCacheSubprovider = require('./subproviders/inflight-cache');
var HookedWalletSubprovider = require('./subproviders/hooked-wallet.js');
var SanitizingSubprovider = require('./subproviders/sanitizer.js');
var InfuraSubprovider = require('./subproviders/infura.js');
var FetchSubprovider = require('./subproviders/fetch.js');
var WebSocketSubprovider = require('./subproviders/websocket.js');

module.exports = ZeroClientProvider;

function ZeroClientProvider() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var connectionType = getConnectionType(opts);

  var engine = new ProviderEngine(opts.engineParams);

  // static
  var staticSubprovider = new DefaultFixture(opts.static);
  engine.addProvider(staticSubprovider);

  // nonce tracker
  engine.addProvider(new NonceTrackerSubprovider());

  // sanitization
  var sanitizer = new SanitizingSubprovider();
  engine.addProvider(sanitizer);

  // cache layer
  var cacheSubprovider = new CacheSubprovider();
  engine.addProvider(cacheSubprovider);

  // filters + subscriptions
  // for websockets, only polyfill filters
  if (connectionType === 'ws') {
    var filterSubprovider = new FilterSubprovider();
    engine.addProvider(filterSubprovider);
    // otherwise, polyfill both subscriptions and filters
  } else {
    var filterAndSubsSubprovider = new SubscriptionSubprovider();
    // forward subscription events through provider
    filterAndSubsSubprovider.on('data', function (err, notification) {
      engine.emit('data', err, notification);
    });
    engine.addProvider(filterAndSubsSubprovider);
  }

  // inflight cache
  var inflightCache = new InflightCacheSubprovider();
  engine.addProvider(inflightCache);

  // id mgmt
  var idmgmtSubprovider = new HookedWalletSubprovider({
    // accounts
    getAccounts: opts.getAccounts,
    // transactions
    processTransaction: opts.processTransaction,
    approveTransaction: opts.approveTransaction,
    signTransaction: opts.signTransaction,
    publishTransaction: opts.publishTransaction,
    // messages
    // old eth_sign
    processMessage: opts.processMessage,
    approveMessage: opts.approveMessage,
    signMessage: opts.signMessage,
    // new personal_sign
    processPersonalMessage: opts.processPersonalMessage,
    processTypedMessage: opts.processTypedMessage,
    approvePersonalMessage: opts.approvePersonalMessage,
    approveTypedMessage: opts.approveTypedMessage,
    signPersonalMessage: opts.signPersonalMessage,
    signTypedMessage: opts.signTypedMessage,
    personalRecoverSigner: opts.personalRecoverSigner
  });
  engine.addProvider(idmgmtSubprovider);

  // data source
  var dataSubprovider = opts.dataSubprovider || createDataSubprovider(connectionType, opts);
  // for websockets, forward subscription events through provider
  if (connectionType === 'ws') {
    dataSubprovider.on('data', function (err, notification) {
      engine.emit('data', err, notification);
    });
  }
  engine.addProvider(dataSubprovider);

  // start polling
  if (!opts.stopped) {
    engine.start();
  }

  return engine;
}

function createDataSubprovider(connectionType, opts) {
  var rpcUrl = opts.rpcUrl,
      debug = opts.debug;

  // default to infura

  if (!connectionType) {
    return new InfuraSubprovider();
  }
  if (connectionType === 'http') {
    return new FetchSubprovider({ rpcUrl: rpcUrl, debug: debug });
  }
  if (connectionType === 'ws') {
    return new WebSocketSubprovider({ rpcUrl: rpcUrl, debug: debug });
  }

  throw new Error('ProviderEngine - unrecognized connectionType "' + connectionType + '"');
}

function getConnectionType(_ref) {
  var rpcUrl = _ref.rpcUrl;

  if (!rpcUrl) return undefined;

  var protocol = rpcUrl.split(':')[0].toLowerCase();
  switch (protocol) {
    case 'http':
    case 'https':
      return 'http';
    case 'ws':
    case 'wss':
      return 'ws';
    default:
      throw new Error('ProviderEngine - unrecognized protocol in "' + rpcUrl + '"');
  }
}