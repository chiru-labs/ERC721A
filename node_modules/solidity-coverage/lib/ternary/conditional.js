/* eslint-env node, mocha */

/*const path = require('path');
const getInstrumentedVersion = require('./../lib/instrumentSolidity.js');
const util = require('./util/util.js');
const CoverageMap = require('./../lib/coverageMap');
const vm = require('./util/vm');
const assert = require('assert');

describe.skip('conditional statements', () => {
  const filePath = path.resolve('./test.sol');
  const pathPrefix = './';

  it('should cover a conditional that reaches the consequent (same-line)', done => {
    const contract = util.getCode('conditional/sameline-consequent.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [1, 0],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover a conditional that reaches the alternate (same-line)', done => {
    const contract = util.getCode('conditional/sameline-alternate.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [0, 1],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover a conditional that reaches the consequent (multi-line)', done => {
    const contract = util.getCode('conditional/multiline-consequent.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [1, 0],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover a conditional that reaches the alternate (multi-line)', done => {
    const contract = util.getCode('conditional/multiline-alternate.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [0, 1],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover a DeclarativeExpression assignment by conditional that reaches the alternate', done => {
    const contract = util.getCode('conditional/declarative-exp-assignment-alternate.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    // Runs bool z = (x) ? false : true;
    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [0, 1],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover an Identifier assignment by conditional that reaches the alternate', done => {
    const contract = util.getCode('conditional/identifier-assignment-alternate.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    // Runs z = (x) ? false : true;
    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        5: 1, 6: 1, 7: 1, 8: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [0, 1],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1, 3: 1, 4: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

  it('should cover an assignment to a member expression (reaches the alternate)', done => {
    const contract = util.getCode('conditional/mapping-assignment.sol');
    const info = getInstrumentedVersion(contract, filePath);
    const coverage = new CoverageMap();
    coverage.addContract(info, filePath);

    vm.execute(info.contract, 'a', []).then(events => {
      const mapping = coverage.generate(events, pathPrefix);
      assert.deepEqual(mapping[filePath].l, {
        11: 1, 12: 1,
      });
      assert.deepEqual(mapping[filePath].b, {
        1: [0, 1],
      });
      assert.deepEqual(mapping[filePath].s, {
        1: 1, 2: 1,
      });
      assert.deepEqual(mapping[filePath].f, {
        1: 1,
      });
      done();
    }).catch(done);
  });

});
*/
