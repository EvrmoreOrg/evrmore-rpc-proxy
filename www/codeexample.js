const { getRPC } = require("../lib/evrmoreRpc");
const { getMethods } = require("../lib/rpcMethodsIndex");
// Use "testnet" when calling a testnet RPC URL; this example assumes mainnet.
const methods = getMethods("mainnet");
//the program  believes that username/password is mandatory,
//so just send in whatever
const username ="whatever";
const password ="whatever"; 
//Check the ENDPOINT URL, "https://evr-rpc-testnet.evrmorecoin.org/rpc" or "https://evr-rpc-mainnet.evrmorecoin.org/rpc"
const rpc = getRPC(username, password, "$ENDPOINT");

const promise = rpc(methods.getassetdata, ["UGLY"]);
promise.catch((e) => {
    console.dir(e);
});

promise.then((response) => {    
        console.log(response);
});