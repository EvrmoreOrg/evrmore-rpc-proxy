# evrmore-rpc-proxy

This repository is based on work by RavenRebels. Thank you Dick Larsson !

The code has been customized for Evrmore. It maintains separate RPC support lists, whitelists, and cachelists for mainnet and testnet, since they are not the same. But each proxy server running instance is either mainnet or testnet (`"network"` in `config.json`). See [docs/operator-rpc-networks.md](docs/operator-rpc-networks.md) and [config.example.json](config.example.json).


## A Web API for Evrmore

**Purpose**: Make Evrmore blockchain available via HTTP/WEB by exposing the RPC-API via a Proxy that only allows safe procedures.

RPC proxy servers for Evrmore are available live at:

    https://evr-rpc-mainnet.evrmorecoin.org/rpc the proxy server and
    https://evr-rpc-mainnet.evrmorecoin.org documentation for mainnet

    https://evr-rpc-testnet.evrmorecoin.org/rpc the proxy server and
    https://evr-rpc-testnet.evrmorecoin.org documentation for testnet

## How do I use this software?

Send requests to the proxy server using HTTP Post. The body of the request should contain string *method** and array **params**. You can use the public live proxy servers or use this repository
to set up a private proxy for yourself.

### Example for web browser and Node.js 18+
(adjust addresses and transaction numbers as needed for Evrmore mainnet or testnet)
```
//Get block count
rpc("getblockcount", []).then(function (count) {
    console.log("Block count", count);
});

//Get transactions in mempool
rpc("getrawmempool", []).then(function (data) {
    console.log("There are", data.length, "transactions in mempool right now");
});

//Get specific transaction
rpc("getrawtransaction", ["301ec56896153463576c47ac40956e58d2b9fa7de87fad39128c5ae0af66b6a4", true]).then(transaction => {
    console.log("Transaction", transaction.hash, "has", transaction.confirmations, "confirmations");
})

//Get address balance
rpc("getaddressbalance", [{ "addresses": ["RXissueSubAssetXXXXXXXXXXXXXWcwhwL"] }]).then(balance => {
    const sum = balance.balance / 1e8;//divide by 100 000 000;
    console.log("RXissueSubAssetXXXXXXXXXXXXXWcwhwL balance", sum.toLocaleString());
})


async function rpc(method, params) {
    const data = { method, params };
    const URL = 'https://evr-rpc-mainnet.evrmorecoin.org/rpc'; //replace with your endpoint
    const response = await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    const obj = await response.json(); // parses JSON response into native JavaScript objects 
    return obj.result;
} 
``` 
## Features and limitations

This software lives up to parts of the JSON-RPC 2.0 Specification
https://www.jsonrpc.org/specification

According to JSON-RPC 2.0 a request object could contain four attributes, jsonrpc, method, params and id.
- This software only supports **method** and **params**.
- This software does NOT support **id**
- This software hardcodes **jsonrpc** to "2.0"
- This sofware does NOT support batch calls.

## How to install
```
git clone https://github.com/EvrmoreOrg/evrmore-rpc-proxy.git
cd evrmore-rpc-proxy
npm install 
```
The proxy server must be connected to at least one fully synchronized Evrmore core node evrmored or evrmore-qt. The RPC user-id/password and url/port of each node must be specified in the proxy server's config.json file:

### How to configure the server
Configure your setup in ./config.json
```
{
  "network": "mainnet",
  "concurrency": 4,
  "endpoint": "https://evr-rpc-mainnet.evrmorecoin.org/rpc",
  "environment": "Evrmore Testnet",
  "local_port": 80,
  "nodes": [
    {
      "name": "Node number 1",
      "username": "dauser",
      "password": "dapassword",
      "evrmore_url": "http://localhost:8819"
    },
    {
      "name": "Nody two tower", 
      "evrmore_url": "http://127.0.0.1:8819",
      "password": "supermega2354ergsecret",
      "username": "supermegas3435ecwertwertret"
    }
  ]
}

```

### The Evrmore core node configuration file evrmore.conf also needs appropriate settings. Here is a recommendation:
```
server=1 
listen=1

#Maintains the full transaction index on your node. Needed if you call getrawtransaction. Default is 0.
txindex=1

#Maintains the full Address index on your node. Needed if you call getaddress* calls. Default is 0.
addressindex=1

#Maintains the full Asset index on your node. Needed if you call getassetdata. Default is 0.
assetindex=1

#Maintains the full Timestamp index on your node. Default is 0.
timestampindex=1

#Maintains the full Spent index on your node. Default is 0.
spentindex=1

#Username and password - set secure username/password
rpcuser=secret
rpcpassword=secret

#What IP address is allowed to make calls to the RPC server.
rpcallowip=127.0.0.1

dbcache=4096
```

## To start the application:

```
npm start
```

## Help with Evrmore RPC calls and arguments
Go to https://evr-rpc-mainnet.evrmorecoin.org or https://evr-rpc-testnet.evrmorecoin.org for in depth descriptions of each RPC call
![image](https://user-images.githubusercontent.com/9694984/212323158-6ed00511-cfcc-4338-990c-ebb57f590cf0.png)
