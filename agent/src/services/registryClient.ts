import { ethers } from "ethers";
import { config } from "../config";

// SovereignAgentRegistry ABI (minimal for our needs)
const REGISTRY_ABI = [
  "function registerAgent(address human, address agentWallet, uint256 initialTrustScore) external",
  "function updateTrustScore(address agentWallet, uint256 newScore) external",
  "function agentOf(address human) external view returns (address)",
  "function trustScore(address agentWallet) external view returns (uint256)",
  "function isVerified(address human) external view returns (bool)",
  "function getAgentData(address human) external view returns (address agent, uint256 score, bool verified)",
  "event AgentRegistered(address indexed human, address indexed agentWallet, uint256 initialTrustScore, uint256 timestamp)",
  "event TrustScoreUpdated(address indexed agentWallet, uint256 oldScore, uint256 newScore, uint256 timestamp)",
];

let provider: ethers.Provider;
let wallet: ethers.Wallet;
let registryContract: ethers.Contract | null = null;

/**
 * Initialize ethers provider and wallet
 */
export function initializeProvider(): void {
  provider = new ethers.JsonRpcProvider(config.katanaRpcUrl);
  wallet = new ethers.Wallet(config.agentPrivateKey, provider);

  console.log("✅ Ethers provider initialized");
  console.log(`   Agent wallet: ${wallet.address}`);
}

/**
 * Initialize registry contract instance
 */
export function initializeRegistry(): void {
  if (
    !config.registryContractAddress ||
    config.registryContractAddress ===
      "0x0000000000000000000000000000000000000000"
  ) {
    console.warn(
      "⚠️  Registry contract not deployed yet. Some features will be unavailable."
    );
    return;
  }

  registryContract = new ethers.Contract(
    config.registryContractAddress,
    REGISTRY_ABI,
    wallet
  );

  console.log("✅ Registry contract initialized");
  console.log(`   Address: ${config.registryContractAddress}`);
}

/**
 * Register a new agent for a verified human
 */
export async function registerAgent(
  humanAddress: string,
  agentWalletAddress: string,
  initialTrustScore: number
): Promise<{ txHash: string; success: boolean }> {
  if (!registryContract) {
    throw new Error("Registry contract not initialized");
  }

  try {
    const tx = await registryContract.registerAgent(
      humanAddress,
      agentWalletAddress,
      initialTrustScore
    );

    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error("❌ Failed to register agent:", error.message);
    throw error;
  }
}

/**
 * Update trust score for an agent
 */
export async function updateTrustScore(
  agentWalletAddress: string,
  newScore: number
): Promise<{ txHash: string; success: boolean }> {
  if (!registryContract) {
    throw new Error("Registry contract not initialized");
  }

  try {
    const tx = await registryContract.updateTrustScore(
      agentWalletAddress,
      newScore
    );
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error("❌ Failed to update trust score:", error.message);
    throw error;
  }
}

/**
 * Get agent data for a human
 */
export async function getAgentData(humanAddress: string): Promise<{
  agentWallet: string;
  trustScore: number;
  verified: boolean;
}> {
  if (!registryContract) {
    throw new Error("Registry contract not initialized");
  }

  try {
    const [agent, score, verified] = await registryContract.getAgentData(
      humanAddress
    );

    return {
      agentWallet: agent,
      trustScore: Number(score),
      verified,
    };
  } catch (error: any) {
    console.error("❌ Failed to get agent data:", error.message);
    throw error;
  }
}

/**
 * Check if a human is verified
 */
export async function isHumanVerified(humanAddress: string): Promise<boolean> {
  if (!registryContract) {
    throw new Error("Registry contract not initialized");
  }

  try {
    return await registryContract.isVerified(humanAddress);
  } catch (error: any) {
    console.error("❌ Failed to check verification:", error.message);
    throw error;
  }
}

/**
 * Get provider instance
 */
export function getProvider(): ethers.Provider {
  return provider;
}

/**
 * Get wallet instance
 */
export function getWallet(): ethers.Wallet {
  return wallet;
}

/**
 * Get registry contract instance
 */
export function getRegistry(): ethers.Contract | null {
  return registryContract;
}
