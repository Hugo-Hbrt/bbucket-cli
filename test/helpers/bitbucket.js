import { createServer } from "node:http";

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function startFakeBitbucket() {
  const handlers = new Map();
  const calls = [];

  const server = createServer((req, res) => {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", () => {
      const parsedBody = rawBody ? safeParseJson(rawBody) : undefined;
      calls.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: parsedBody,
        rawBody,
      });
      const rawPathname = req.url.split("?")[0];
      const pathname = decodeURIComponent(rawPathname);
      const key = `${req.method} ${pathname}`;
      const handler = handlers.get(key);
      if (!handler) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ type: "error", error: { message: `no stub for ${key}` } }));
        return;
      }
      const isString = typeof handler.body === "string";
      const contentType = isString ? "text/plain" : "application/json";
      const responseBody = isString ? handler.body : JSON.stringify(handler.body ?? {});
      res.writeHead(handler.status ?? 200, { "content-type": contentType });
      res.end(responseBody);
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;

  return {
    url,
    stub(method, path, response) {
      handlers.set(`${method} ${path}`, response);
    },
    calls,
    reset() {
      handlers.clear();
      calls.length = 0;
    },
    async stop() {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
