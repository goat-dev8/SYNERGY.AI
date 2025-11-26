/**
 * Frontend Environment Configuration
 *
 * Validates and exports environment variables.
 * All VITE_ variables are PUBLIC and embedded in the browser bundle.
 */

interface EnvConfig {
  katanaRpcUrl: string;
  katanaChainId: number;
  katanaExplorerUrl: string;
  agentBackendUrl: string;
  identityVerifierUrl: string;
  enableTestnet: boolean;
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = import.meta.env[key];

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || "";
}

export const env: EnvConfig = {
  katanaRpcUrl: getEnvVar("VITE_KATANA_RPC_URL"),
  katanaChainId: parseInt(getEnvVar("VITE_KATANA_CHAIN_ID"), 10),
  katanaExplorerUrl: getEnvVar("VITE_KATANA_EXPLORER_URL"),
  agentBackendUrl: getEnvVar("VITE_AGENT_BACKEND_URL"),
  identityVerifierUrl: getEnvVar("VITE_IDENTITY_VERIFIER_API_URL"),
  enableTestnet: getEnvVar("VITE_ENABLE_TESTNET", false) === "true",
};

// Validate configuration on load
if (!env.katanaRpcUrl.startsWith("http")) {
  throw new Error(
    "Invalid VITE_KATANA_RPC_URL: must start with http:// or https://"
  );
}

if (isNaN(env.katanaChainId)) {
  throw new Error("Invalid VITE_KATANA_CHAIN_ID: must be a number");
}

// Log configuration (dev only)
if (import.meta.env.DEV) {
  console.log("🔧 Frontend Configuration:");
  console.log("  Katana RPC:", env.katanaRpcUrl);
  console.log("  Chain ID:", env.katanaChainId);
  console.log("  Backend:", env.agentBackendUrl);
  console.log("  Explorer:", env.katanaExplorerUrl);
}

export default env;
