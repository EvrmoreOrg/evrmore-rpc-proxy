const { getRPC } = require("./lib/evrmoreRpc");

const getConfig = require("./getConfig");
const config = getConfig();
const allNodes = [];

//At startup initialize all RPCs, you can have one or multiple Evrmore nodes
for (const node of config.nodes) {
  const rpc = getRPC(node.username, node.password, node.evrmore_url);
  allNodes.push({ name: node.name, rpc });
}

/* Every x seconds, check the status of the nodes */
async function healthCheck() {
  for (const node of allNodes) {
    try {
      const a = await node.rpc("getbestblockhash", []);
      node.bestblockhash = a;
   
      node.active = true;
    } catch {
      node.active = false;
    }
  }
}
setInterval(healthCheck, 10 * 1000);
healthCheck();

 
function getRPCNode() {
  
  for (const n of allNodes) {
    if (n.active === true) {
      return {
        rpc: n.rpc,
        name: n.name,
      };
    }
  }
  //We did not find any active node so we return the first
  return {
    name: allNodes[0].name,
    rpc: allNodes[0].rpc,
  };
}
function getNodes() {
  const list = [];
  for (const n of allNodes) {
    list.push({
      active: n.active,
      bestblockhash: n.bestblockhash,
      name: n.name,
      network: config.network,
    });
  }
  return list;
}
module.exports = { getRPCNode, getNodes };
