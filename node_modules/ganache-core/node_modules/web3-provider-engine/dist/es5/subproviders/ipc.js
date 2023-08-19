'use strict';

var net = require('net');
var inherits = require('util').inherits;
var createPayload = require('../util/create-payload.js');
var Subprovider = require('./subprovider.js');

module.exports = IpcSource;

inherits(IpcSource, Subprovider);

function IpcSource(opts) {
  var self = this;
  self.ipcPath = opts.ipcPath || '/root/.ethereum/geth.ipc';
}

IpcSource.prototype.handleRequest = function (payload, next, end) {
  var self = this;
  var targetPath = self.ipcPath;
  var method = payload.method;
  var params = payload.params;

  // new payload with random large id,
  // so as not to conflict with other concurrent users
  var newPayload = createPayload(payload);
  // console.log('------------------ network attempt -----------------')
  // console.log(payload)
  // console.log('---------------------------------------------')

  if (newPayload == null) {
    console.log('no payload');
    end('no payload', null);
  }

  var client = net.connect({ path: targetPath }, function () {
    client.end(JSON.stringify(payload));
  });

  client.on('connection', function (d) {
    console.log(d);
  });

  client.on('data', function (data) {
    var response = "";
    response += data.toString();
    var res = JSON.parse(response);
    end(null, res.result);
  });

  // client.on('end', () => {
  //   console.log('Socket Received payload');
  // });

  client.on('error', function (error) {
    console.error(error);
    end(error, null);
  });

  process.setMaxListeners(Infinity);

  process.on('SIGINT', function () {
    console.log("Caught interrupt signal");

    client.end();
    process.exit();
  });
};