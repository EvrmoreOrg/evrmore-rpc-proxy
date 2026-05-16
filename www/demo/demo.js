function toDisplayString(value) {
  if (value === undefined) {
    return "";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/** Same-origin RPC URL for browser use (avoids CORS on settings.endpoint). */
function rpcPostUrl(settings) {
  try {
    const configured = new URL(settings.endpoint, window.location.origin);
    if (configured.origin === window.location.origin) {
      return configured.pathname + configured.search;
    }
  } catch (e) {
    /* use default */
  }
  return "/rpc";
}

(async function () {
  const heading = document.querySelector("h1");
  const content = document.getElementById("content");
  const status = document.getElementById("status");

  status.textContent = "Loading…";

  try {
    const settings = await fetch("/settings").then((r) => r.json());
    heading.textContent = settings.environment + " RPC";
    document.title = settings.environment + " RPC";

    const response = await fetch(rpcPostUrl(settings), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "getblockchaininfo", params: [] }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      status.textContent = "Error";
      content.textContent = toDisplayString(data);
      return;
    }

    status.textContent = "";
    content.textContent = toDisplayString(data.result);
  } catch (e) {
    status.textContent = "Error";
    content.textContent = toDisplayString(e.message || e);
  }
})();
