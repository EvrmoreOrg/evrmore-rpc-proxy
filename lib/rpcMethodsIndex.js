/**
 * Select RPC method name map by network (mainnet | testnet).
 */
"use strict";

const networks = {
  mainnet: require("./rpcMethods.mainnet").methods,
  testnet: require("./rpcMethods.testnet").methods,
};

function getMethods(network) {
  const m = networks[network];
  if (!m) {
    throw new Error(
      'Invalid network "' +
        network +
        '": expected "mainnet" or "testnet"'
    );
  }
  return m;
}

module.exports = { getMethods };
