if (global && global.__hardhatContext){
  require("./hardhat.plugin");
  return;
}

module.exports = require('./buidler.plugin')
