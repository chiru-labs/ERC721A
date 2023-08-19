// eslint-disable-next-line import/no-extraneous-dependencies
const dirToObject = require('dir-to-object');

function makeData(dir) {
  const nodes = Object.keys(
    dirToObject(`${__dirname}/${dir}`, { canAdd: (data) => data.print })
  ).reduce((accumulator, current) => {
    accumulator[current] = `require('./${current}')`;
    return accumulator;
  }, {});

  const data = `/* This file was automatically generated on ${
    Date.now() / 1000
  } */

  /* eslint-disable global-require */

  module.exports = ${JSON.stringify(nodes)};`;

  return data.replace(/["]+/g, '');
}

module.exports = makeData;
