'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = Stoplight;

inherits(Stoplight, EventEmitter);

function Stoplight() {
  var self = this;
  EventEmitter.call(self);
  self.isLocked = true;
}

Stoplight.prototype.go = function () {
  var self = this;
  self.isLocked = false;
  self.emit('unlock');
};

Stoplight.prototype.stop = function () {
  var self = this;
  self.isLocked = true;
  self.emit('lock');
};

Stoplight.prototype.await = function (fn) {
  var self = this;
  if (self.isLocked) {
    self.once('unlock', fn);
  } else {
    setTimeout(fn);
  }
};