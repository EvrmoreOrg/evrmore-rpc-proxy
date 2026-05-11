# Evrmore RPC proxy: operators guide (mainnet vs testnet)

This proxy runs **one network per process**. To serve both mainnet and testnet, run **two instances** (separate `config.json`, separate `local_port`, separate backend URLs in `nodes`).

Top-level config field **`"network"`** must be **`"mainnet"`** or **`"testnet"`**. The process loads the matching RPC name map, whitelist, and cache rules for that network only.

See also: [config.example.json](../config.example.json).

---

## 1. Deploy a testnet instance (first time)

Follow these steps in order.

1. **Copy your mainnet config** to a new file (example: `config.testnet.json`) so you keep credentials and structure consistent, or copy [config.example.json](../config.example.json) to `config.json` and adjust.

2. **Set the network flag** at the top level of the JSON:

   - `"network": "testnet"`

3. **Point every `nodes[]` entry at testnet RPC endpoints** (correct host, port, and path for your testnet Evrmore Core). Typical testnet RPC port differs from mainnet; confirm with your node operator docs.

4. **Set a distinct `local_port`** (and/or reverse proxy rule) so this process does not collide with your mainnet proxy on the same host.

5. **Start the testnet proxy** with that config (the app loads `./config.json` from the current working directory).

6. **Verify**:

   - Open `GET /settings` on the testnet port and confirm the response includes `"network": "testnet"`.
   - Call `GET /whitelist` on the testnet port and confirm it returns the **testnet** whitelist (initially identical to mainnet in the repository until you customize it).
   - Send a safe read-only `POST /rpc` (for example `getblockcount` with `params: []`) and confirm the result matches your testnet node.

You do **not** merge mainnet and testnet into one config: one `network` value per file, one process per file.

---

## 2. Customize testnet support (RPC names, whitelist, cache)

The repository keeps **two full independent** copies of data—**not** “mainnet plus a diff.” After the initial release, testnet files may match mainnet; you change testnet-only pieces on the testnet side.

### 2a. Testnet gained new or renamed RPC methods (method name map)

**Files:** `lib/docs.testnet.json` (source catalog) → generated `lib/rpcMethods.testnet.js`.

1. Update **`lib/docs.testnet.json`** using your authoritative source (for example regenerated help output from **testnet** `evrmore-cli`, or the same workflow you use for the standalone `evrmore-rpc` package’s `docs.json`). This file must remain a **complete** catalog for testnet, not a patch file.

2. From the repository root, run:

   ```bash
   npm run generate-rpc-methods
   ```

   This rebuilds **both** `lib/rpcMethods.mainnet.js` and `lib/rpcMethods.testnet.js` from `lib/docs.mainnet.json` and `lib/docs.testnet.json`.

3. **Commit** the updated `lib/docs.testnet.json` and regenerated `lib/rpcMethods.testnet.js`.

4. Client-side examples may import `lib/rpcMethods.testnet.js` when targeting a testnet deployment; the running proxy selects maps using `config.network`.

### 2b. Allow or deny RPCs on testnet (whitelist)

**File:** `whitelist.js` — the **testnet** array `whitelistTestnet` is a complete list of method names permitted for `network: "testnet"`.

1. Edit the **testnet** array only (do not rely on “inherits from mainnet”).

2. Add a string for each new RPC name you want to expose through the proxy; remove names you want to block.

3. Restart the proxy so changes take effect.

4. Confirm with `GET /whitelist` on the testnet instance.

### 2c. New read-only RPCs and response caching

**File:** `cacheService.js` — **testnet** has its own full list `CACHEABLE_TESTNET` of methods eligible for caching.

1. If a **new testnet read** should be cached across requests within the same block tip, add that method string to **`CACHEABLE_TESTNET`** only (mirror the pattern used for existing entries).

2. If the RPC must **never** be cached (writes, heavy calls, semantics unsafe for stale reads), **omit** it from the cacheable list.

3. Restart and load-test if the method is expensive.

---

## 3. When mainnet RPC methods change (future)

Examples: a new Evrmore Core release adds RPCs, renames a call, or updates help text that feeds your catalog.

1. **Refresh the mainnet catalog**  
   Update **`lib/docs.mainnet.json`** from your mainnet source of truth (must remain a **full** mainnet file).

2. **Regenerate constants**  

   ```bash
   npm run generate-rpc-methods
   ```

   so **`lib/rpcMethods.mainnet.js`** matches the updated JSON.

3. **Review security surface**  
   Open **`whitelist.js`** and update **`whitelistMainnet`**:

   - Add new method names only if operators intend to expose them through this proxy.
   - Remove or avoid names that should stay blocked.

4. **Review caching**  
   In **`cacheService.js`**, update **`CACHEABLE_MAINNET`** if new **safe, read-only** RPCs should participate in block-tip caching; skip mutating or expensive calls.

5. **Test and deploy**  
   Restart a staging mainnet instance, hit `GET /whitelist`, run representative `POST /rpc` calls, then roll out.

6. **Commit** changed `lib/docs.mainnet.json`, `lib/rpcMethods.mainnet.js`, and any whitelist/cache edits.

**Do not** change `lib/docs.testnet.json` unless testnet Core also changed in the same way you care about—mainnet and testnet catalogs are independent.

---

## 4. When testnet RPC methods change (future)

Follow the same discipline as section 3, but touch **only testnet artifacts**:

1. Update **`lib/docs.testnet.json`** from **testnet** Core (full file).

2. Run **`npm run generate-rpc-methods`** to refresh **`lib/rpcMethods.testnet.js`**.

3. Adjust **`whitelistTestnet`** in **`whitelist.js`** and **`CACHEABLE_TESTNET`** in **`cacheService.js`** as needed.

4. Restart the **testnet** proxy instance; leave the mainnet instance unchanged unless you also have a mainnet release to track (section 3).

---

## 5. Quick reference (files per concern)

| Concern | Mainnet | Testnet |
|--------|---------|---------|
| RPC catalog (source) | `lib/docs.mainnet.json` | `lib/docs.testnet.json` |
| Generated name map | `lib/rpcMethods.mainnet.js` | `lib/rpcMethods.testnet.js` |
| Allowed methods | `whitelist.js` → `whitelistMainnet` | `whitelist.js` → `whitelistTestnet` |
| Cacheable reads | `cacheService.js` → `CACHEABLE_MAINNET` | `cacheService.js` → `CACHEABLE_TESTNET` |
| Which row loads | `config.json` → `"network": "mainnet"` | `config.json` → `"network": "testnet"` |

---

## 6. Operational reminders

- **Two ports / two configs** for two networks—never point `network: "testnet"` at mainnet RPC URLs.
- After any edit to `docs.*.json`, **regenerate** `rpcMethods.*.js` with `npm run generate-rpc-methods` before production deploy.
- Whitelist and cache lists are **manual policy**; new RPCs in Core are **not** automatically exposed or cached.
