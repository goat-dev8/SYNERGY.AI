import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";

async function main() {
  console.log(
    "🚀 Starting SynergyAI contract deployment to Katana Network...\n"
  );

  const [deployer] = await ethers.getSigners();

  console.log("📍 Deploying from account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy SovereignAgentRegistry
  console.log("📝 Deploying SovereignAgentRegistry...");
  const Registry = await ethers.getContractFactory("SovereignAgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  console.log("✅ SovereignAgentRegistry deployed to:", registryAddress);
  console.log("   Owner:", await registry.owner());
  console.log(
    "   Max Trust Score:",
    await registry.MAX_TRUST_SCORE(),
    "basis points\n"
  );

  // Deploy a sample SovereignAgentWallet for testing
  console.log("📝 Deploying sample SovereignAgentWallet...");
  const Wallet = await ethers.getContractFactory("SovereignAgentWallet");
  const sampleWallet = await Wallet.deploy(deployer.address);
  await sampleWallet.waitForDeployment();
  const sampleWalletAddress = await sampleWallet.getAddress();

  console.log(
    "✅ Sample SovereignAgentWallet deployed to:",
    sampleWalletAddress
  );
  console.log("   Owner:", await sampleWallet.owner());
  console.log("   Operator:", (await sampleWallet.operator()) || "(not set)\n");

  // Save deployment addresses
  const deploymentInfo = {
    network: "katana",
    chainId: 747474,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SovereignAgentRegistry: registryAddress,
      SampleAgentWallet: sampleWalletAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, "katana.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment info saved to:", deploymentFile);

  // Update .env files
  console.log("\n📝 Updating environment variables...");

  const envUpdates = `
# Deployed Contract Addresses (Katana Mainnet)
REGISTRY_CONTRACT_ADDRESS=${registryAddress}
SAMPLE_AGENT_WALLET_ADDRESS=${sampleWalletAddress}
`;

  // Update agent/.env
  const agentEnvPath = path.join(__dirname, "..", "..", "agent", ".env");
  if (fs.existsSync(agentEnvPath)) {
    let agentEnv = fs.readFileSync(agentEnvPath, "utf-8");

    // Remove old contract addresses if they exist
    agentEnv = agentEnv.replace(
      /\n# Deployed Contract Addresses[\s\S]*?(?=\n[A-Z_]+=|\n$|$)/g,
      ""
    );
    agentEnv = agentEnv.replace(/REGISTRY_CONTRACT_ADDRESS=.*/g, "");
    agentEnv = agentEnv.replace(/SAMPLE_AGENT_WALLET_ADDRESS=.*/g, "");

    // Add new addresses
    agentEnv = agentEnv.trim() + envUpdates;

    fs.writeFileSync(agentEnvPath, agentEnv);
    console.log("✅ Updated agent/.env");
  }

  // Update front/.env
  const frontEnvPath = path.join(__dirname, "..", "..", "front", ".env");
  if (fs.existsSync(frontEnvPath)) {
    let frontEnv = fs.readFileSync(frontEnvPath, "utf-8");

    const frontEnvUpdate = `\nVITE_REGISTRY_CONTRACT_ADDRESS=${registryAddress}\n`;

    frontEnv = frontEnv.replace(/VITE_REGISTRY_CONTRACT_ADDRESS=.*/g, "");
    frontEnv = frontEnv.trim() + frontEnvUpdate;

    fs.writeFileSync(frontEnvPath, frontEnv);
    console.log("✅ Updated front/.env");
  }

  console.log("\n🎉 Deployment complete!\n");
  console.log("📋 Summary:");
  console.log("   Network: Katana (747474)");
  console.log("   Registry:", registryAddress);
  console.log("   Sample Wallet:", sampleWalletAddress);
  console.log("\n🔗 View on Katana Explorer:");
  console.log(
    "   Registry:",
    `https://katanascan.com/address/${registryAddress}`
  );
  console.log(
    "   Wallet:",
    `https://katanascan.com/address/${sampleWalletAddress}`
  );
  console.log("\n✨ Next steps:");
  console.log("   1. Verify contracts on Katana Explorer");
  console.log("   2. Start the agent backend: cd ../agent && npm run dev");
  console.log("   3. Start the frontend: cd ../front && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
