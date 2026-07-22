import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function run() {
  const transport = new SSEClientTransport(new URL("https://stitch.googleapis.com/mcp/sse"), {
    requestInit: {
        headers: {
          "X-Goog-Api-Key": process.env.GCP_API_KEY || "YOUR_API_KEY_HERE"
        }
    }
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  await client.connect(transport);
  
  console.log("--- TOOLS ---");
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  
  console.log("--- RESOURCES ---");
  const resources = await client.listResources();
  console.log(JSON.stringify(resources, null, 2));

  console.log("--- PROMPTS ---");
  const prompts = await client.listPrompts();
  console.log(JSON.stringify(prompts, null, 2));

  process.exit(0);
}

run().catch(console.error);
