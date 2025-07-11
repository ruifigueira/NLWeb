import { Container, loadBalance, getContainer } from "@cloudflare/containers";

export class NLWebContainer extends Container<Env> {
  defaultPort = 8000;
  sleepAfter = "2m";

  envVars = {
    OPENAI_API_KEY: this.env.OPENAI_API_KEY,
    NLWEB_LOGGING_PROFILE: "production",
    OPENAI_ENDPOINT: "https://api.openai.com/v1/chat/completions",
    QDRANT_URL: "http://localhost:6333",
    QDRANT_API_KEY: "<OPTIONAL>",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const container = getContainer(env.NLWEB_CONTAINER);
    const response = await container.fetch(request);

    if (!url.pathname.startsWith("/mcp")) {
      return response;
    }

    // Create a new response with the original response's body and the CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "access-control-allow-headers": "Content-Type, mcp-session-id, mcp-protocol-version",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-origin": "*",
        "access-control-expose-headers": "mcp-session-id",
      },
    });
  },
} satisfies ExportedHandler<Env>;
