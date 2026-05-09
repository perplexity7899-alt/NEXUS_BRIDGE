import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Dynamically import the server entry to ensure it's using the built dist/server version
    const { default: serverHandler } = await import("../dist/server/index.js");
    
    // Build the full URL
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url || "/", `${protocol}://${host}`);

    // Create a Web API Request
    const request = new Request(url, {
      method: req.method,
      headers: Object.entries(req.headers).reduce(
        (acc, [key, value]) => {
          if (Array.isArray(value)) {
            acc[key] = value.join(",");
          } else if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body || {})
          : undefined,
    });

    // Call the server handler
    const response = await serverHandler.fetch(request, {}, {});

    // Set response status
    res.status(response.status);

    // Set response headers
    response.headers.forEach((value, key) => {
      // Skip content-encoding if we're not compressing
      if (key.toLowerCase() === "content-encoding") return;
      res.setHeader(key, value);
    });

    // Send response body
    const body = await response.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (error) {
    console.error("API handler error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
