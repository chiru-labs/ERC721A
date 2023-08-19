const { web3, BN } = require('./setup');
const { expect } = require('chai');
const flatten = require('lodash.flatten');

const { deprecate } = require('util');

function expectEvent (receipt, eventName, eventArgs = {}) {
  // truffle contract receipts have a 'logs' object, with an array of objects
  // with 'event' and 'args' properties, containing the event name and actual
  // values.
  // web3 contract receipts instead have an 'events' object, with properties
  // named after emitted events, each containing an object with 'returnValues'
  // holding the event data, or an array of these if multiple were emitted.

  // The simplest way to handle both of these receipts is to convert the web3
  // event format into the truffle one.

  if (isWeb3Receipt(receipt)) {
    const logs = flatten(Object.keys(receipt.events).map(name => {
      if (Array.isArray(receipt.events[name])) {
        return receipt.events[name].map(event => ({ event: name, args: event.returnValues }));
      } else {
        return ({ event: name, args: receipt.events[name].returnValues });
      }
    }));

    return inLogs(logs, eventName, eventArgs);
  } else if (isTruffleReceipt(receipt)) {
    return inLogs(receipt.logs, eventName, eventArgs);
  } else {
    throw new Error('Unknown transaction receipt object');
  }
}

function notExpectEvent (receipt, eventName) {
  if (isWeb3Receipt(receipt)) {
    // We don't need arguments for the assertion, so let's just map it to the expected format.
    const logsWithoutArgs = Object.keys(receipt.events).map(name => {
      return { event: name };
    });
    notInLogs(logsWithoutArgs, eventName);
  } else if (isTruffleReceipt(receipt)) {
    notInLogs(receipt.logs, eventName);
  } else {
    throw new Error('Unknown transaction receipt object');
  }
}

function inLogs (logs, eventName, eventArgs = {}) {
  const events = logs.filter(e => e.event === eventName);
  expect(events.length > 0).to.equal(true, `No '${eventName}' events found`);

  const exception = [];
  const event = events.find(function (e) {
    for (const [k, v] of Object.entries(eventArgs)) {
      try {
        contains(e.args, k, v);
      } catch (error) {
        exception.push(error);
        return false;
      }
    }
    return true;
  });

  if (event === undefined) {
    throw exception[0];
  }

  return event;
}

function notInLogs (logs, eventName) {
  // eslint-disable-next-line no-unused-expressions
  expect(logs.find(e => e.event === eventName), `Event ${eventName} was found`).to.be.undefined;
}

async function inConstruction (contract, eventName, eventArgs = {}) {
  if (!isTruffleContract(contract)) {
    throw new Error('expectEvent.inConstruction is only supported for truffle-contract objects');
  }

  return inTransaction(contract.transactionHash, contract.constructor, eventName, eventArgs);
}

async function notInConstruction (contract, eventName) {
  if (!isTruffleContract(contract)) {
    throw new Error('expectEvent.inConstruction is only supported for truffle-contract objects');
  }
  return notInTransaction(contract.transactionHash, contract.constructor, eventName);
}

async function inTransaction (txHash, emitter, eventName, eventArgs = {}) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);

  const logs = decodeLogs(receipt.logs, emitter, eventName);
  return inLogs(logs, eventName, eventArgs);
}

async function notInTransaction (txHash, emitter, eventName) {
  const receipt = await web3.eth.getTransactionReceipt(txHash);

  const logs = decodeLogs(receipt.logs, emitter, eventName);
  notInLogs(logs, eventName);
}

// This decodes longs for a single event type, and returns a decoded object in
// the same form truffle-contract uses on its receipts
function decodeLogs (logs, emitter, eventName) {
  let abi;
  let address;
  if (isWeb3Contract(emitter)) {
    abi = emitter.options.jsonInterface;
    address = emitter.options.address;
  } else if (isTruffleContract(emitter)) {
    abi = emitter.abi;
    try {
      address = emitter.address;
    } catch (e) {
      address = null;
    }
  } else {
    throw new Error('Unknown contract object');
  }

  let eventABI = abi.filter(x => x.type === 'event' && x.name === eventName);
  if (eventABI.length === 0) {
    throw new Error(`No ABI entry for event '${eventName}'`);
  } else if (eventABI.length > 1) {
    throw new Error(`Multiple ABI entries for event '${eventName}', only uniquely named events are supported`);
  }

  eventABI = eventABI[0];

  // The first topic will equal the hash of the event signature
  const eventSignature = `${eventName}(${eventABI.inputs.map(input => input.type).join(',')})`;
  const eventTopic = web3.utils.sha3(eventSignature);

  // Only decode events of type 'EventName'
  return logs
    .filter(log => log.topics.length > 0 && log.topics[0] === eventTopic && (!address || log.address === address))
    .map(log => web3.eth.abi.decodeLog(eventABI.inputs, log.data, log.topics.slice(1)))
    .map(decoded => ({ event: eventName, args: decoded }));
}

function contains (args, key, value) {
  expect(key in args).to.equal(true, `Event argument '${key}' not found`);

  if (value === null) {
    expect(args[key]).to.equal(null,
      `expected event argument '${key}' to be null but got ${args[key]}`);
  } else if (isBN(args[key]) || isBN(value)) {
    const actual = isBN(args[key]) ? args[key].toString() : args[key];
    const expected = isBN(value) ? value.toString() : value;
    expect(args[key]).to.be.bignumber.equal(value,
      `expected event argument '${key}' to have value ${expected} but got ${actual}`);
  } else {
    expect(args[key]).to.be.deep.equal(value,
      `expected event argument '${key}' to have value ${value} but got ${args[key]}`);
  }
}

function isBN (object) {
  return BN.isBN(object) || object instanceof BN;
}

function isWeb3Receipt (receipt) {
  return 'events' in receipt && typeof receipt.events === 'object';
}

function isTruffleReceipt (receipt) {
  return 'logs' in receipt && typeof receipt.logs === 'object';
}

function isWeb3Contract (contract) {
  return 'options' in contract && typeof contract.options === 'object';
}

function isTruffleContract (contract) {
  return 'abi' in contract && typeof contract.abi === 'object';
}

expectEvent.inLogs = deprecate(inLogs, 'expectEvent.inLogs() is deprecated. Use expectEvent() instead.');
expectEvent.inConstruction = inConstruction;
expectEvent.inTransaction = inTransaction;

expectEvent.notEmitted = notExpectEvent;
expectEvent.notEmitted.inConstruction = notInConstruction;
expectEvent.notEmitted.inTransaction = notInTransaction;

expectEvent.not = {};
expectEvent.not.inConstruction = deprecate(
  notInConstruction,
  'expectEvent.not is deprecated. Use expectEvent.notEmitted instead.'
);
expectEvent.not.inTransaction = deprecate(
  notInTransaction,
  'expectEvent.not is deprecated. Use expectEvent.notEmitted instead.'
);

module.exports = expectEvent;
