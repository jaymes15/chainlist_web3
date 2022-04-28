var ChainList = artifacts.require("./chainList.sol");

module.exports = function(deployer) {
  deployer.deploy(ChainList);
};
