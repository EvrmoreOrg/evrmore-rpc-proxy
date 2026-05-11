/**
 * JSON-RPC client for Evrmore Core (vendored from @ravenrebels/ravencoin-rpc / evrmore-rpc).
 * SPDX: MIT — Copyright (c) 2022 Raven Rebels — see lib/LICENSE-evrmore-rpc.txt
 *
 * Requires Node.js 18+ (global fetch).
 */
"use strict";

function throwSyntaxError() {
  throw new Error("Syntax error, call getRPC with (username, password, URL)");
}

function getRPC(username, password, URL) {
  if (!username) {
    throwSyntaxError();
  }
  if (!password) {
    throwSyntaxError();
  }
  if (!URL) {
    throwSyntaxError();
  }

  return function rpc(method, params) {
    const promise = new Promise((resolutionFunc, rejectionFunc) => {
      const data = {
        jsonrpc: "2.0",
        id: Math.random(),
        method,
        params,
      };

      try {
        const rpcResponse = postData(URL, data, username, password);

        rpcResponse
          .then(async (response) => {
            if (response.ok) {
              const obj = await response.json();
              resolutionFunc(obj.result);
            } else if (response.status !== 200) {
              let obj = {
                error: null,
                description: null,
              };
              try {
                obj = await response.json();
              } catch {
                /* ignore */
              }
              const myError = {
                statusText: response.statusText,
                status: response.status,
                description: obj.description,
                error: obj.error,
              };

              rejectionFunc(myError);
            }
          })
          .catch((e) => {
            rejectionFunc({
              originalError: e,
              type: "ServerUnreachable",
              error: "Could not communicate with Evrmore core node",
              description:
                "Are you sure that the URL is correct? The URL is usually mainnet = http://127.0.0.1:8766 and testnet =  http://127.0.0.1:18766",
            });
          });
      } catch (e) {
        rejectionFunc(e.message || e);
      }
    });
    return promise;
  };
}

async function postData(url = "", data = {}, username, password) {
  let base64Credentials = "";

  if (typeof Buffer !== "undefined") {
    base64Credentials = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );
  } else if (typeof btoa === "function") {
    base64Credentials = btoa(`${username}:${password}`);
  }

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: "Basic " + base64Credentials,
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response;
}

module.exports = { getRPC };
