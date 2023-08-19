const { BN } = require('./src/setup');

module.exports = {
  BN,
  get balance () { return require('./src/balance'); },
  get constants () { return require('./src/constants'); },
  get ether () { return require('./src/ether'); },
  get expectEvent () { return require('./src/expectEvent'); },
  get makeInterfaceId () { return require('./src/makeInterfaceId'); },
  get send () { return require('./src/send'); },
  get expectRevert () { return require('./src/expectRevert'); },
  get singletons () { return require('./src/singletons'); },
  get time () { return require('./src/time'); },
  get snapshot () { return require('./src/snapshot'); },
};
