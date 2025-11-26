import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  backendUrl: string; // Public URL for callbacks (ngrok in dev, production URL in prod)
  katanaRpcUrl: string;
  agentPrivateKey: string;
  registryContractAddress: string;
  sushiRouterAddress: string;
  openaiApiKey: string;
  priceFeedUrl: string;
  privadoVerifierUrl: string;
  privadoVerifierDid: string; // Verifier DID for Privado ID authentication
  vbUsdcAddress: string;
  wethAddress: string;
  katAddress: string;
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value || "";
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3001", 10),

  // Backend URL (REQUIRED for Privado ID callbacks - use ngrok in development)
  backendUrl:
    getEnvVar("BACKEND_URL", false) ||
    `http://localhost:${process.env.PORT || "3001"}`,

  // Network Configuration
  katanaRpcUrl: getEnvVar("KATANA_RPC_URL"),

  // Private Keys (NEVER log these)
  agentPrivateKey: getEnvVar("AGENT_PRIVATE_KEY"),

  // Contract Addresses
  registryContractAddress: getEnvVar("REGISTRY_CONTRACT_ADDRESS", false),
  sushiRouterAddress:
    getEnvVar("SUSHI_ROUTER_ADDRESS", false) ||
    "0x0000000000000000000000000000000000000000", // TODO: Get real address

  // API Keys
  openaiApiKey: getEnvVar("OPENAI_API_KEY", false),

  // External Services
  priceFeedUrl:
    getEnvVar("PRICE_FEED_URL", false) ||
    "https://api.coingecko.com/api/v3/simple/price",
  privadoVerifierUrl:
    getEnvVar("PRIVADO_ID_VERIFIER_URL", false) ||
    "https://verifier.privado.id",
  privadoVerifierDid:
    getEnvVar("PRIVADO_VERIFIER_DID", false) ||
    "did:iden3:privado:main:2ShVftBmNha7XccjvM6L6fT3Q6xDp7CJaSoGYKABut", // Default verifier DID

  // Token Addresses on Katana
  vbUsdcAddress:
    getEnvVar("VBUSDC_TOKEN_ADDRESS", false) ||
    "0x0000000000000000000000000000000000000000", // TODO: Get real address
  wethAddress:
    getEnvVar("WETH_TOKEN_ADDRESS", false) ||
    "0x0000000000000000000000000000000000000000", // TODO: Get real address
  katAddress:
    getEnvVar("KAT_TOKEN_ADDRESS", false) ||
    "0x0000000000000000000000000000000000000000", // TODO: Get real address
};

// Validate critical configuration
export function validateConfig(): void {
  console.log("🔧 Validating configuration...");

  const errors: string[] = [];

  if (!config.katanaRpcUrl) {
    errors.push("KATANA_RPC_URL is required");
  }

  if (!config.agentPrivateKey || config.agentPrivateKey.length < 64) {
    errors.push(
      "AGENT_PRIVATE_KEY is required and must be a valid private key"
    );
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors:");
    errors.forEach((error) => console.error(`   - ${error}`));
    throw new Error("Invalid configuration");
  }

  console.log("✅ Configuration validated");
  console.log(`   Port: ${config.port}`);
  console.log(`   Katana RPC: ${config.katanaRpcUrl}`);
  console.log(
    `   Registry: ${config.registryContractAddress || "Not deployed yet"}`
  );
  console.log(`   Sushi Router: ${config.sushiRouterAddress}`);
}
