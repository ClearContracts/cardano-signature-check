const http = require("http");
const handler = require("./api/verify");

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/verify" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }

      // Mock res.status().json() for Vercel-style handler
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      await handler(req, res);
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
