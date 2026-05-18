function validateConfig(config) {
  const n = config.network;
  if (n !== "mainnet" && n !== "testnet") {
    console.error(
      'config.json must include top-level "network": "mainnet" or "testnet".'
    );
    process.exit(1);
  }
}

function getConfig() {
  try {
    const config = require("./config.json");
    validateConfig(config);
    return config;
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      console.log("Could not find config.json");
      console.log("Please create a config.json file (see config.example.json)");

      const template = `
    {
        "network": "mainnet",
        "concurrency": 4,
        "endpoint": "https://evr-rpc-mainnet.evrmorecoin.org/rpc",
        "environment": "Evrmore Mainnet",
        "local_port": 80,
        "nodes": [
          {
            "name": "Node number 1",
            "username": "dauser",
            "password": "dapassword",
            "evrmore_url": "http://localhost:8819"
          },
          {
            "name": "Node number 2",
            "evrmore_url": "http://127.0.0.1:8819",
            "password": "secret",
            "username": "secret"
          }
        ]
      }
    `;

      console.log("Example content of config.json");
      console.info(template);

      process.exit(1);
    }
    throw e;
  }
}

module.exports = getConfig;
