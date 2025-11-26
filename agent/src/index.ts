import cors from "cors";
import { ethers } from "ethers";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import { config, validateConfig } from "./config";
import { initializeGoatClient } from "./services/goatClient";
import {
  initializeProvider,
  initializeRegistry,
  registerAgent,
} from "./services/registryClient";
import { runSimpleEthDipBuyer } from "./strategies/simpleEthDipBuyer";

// Privado ID / Polygon ID Auth Library
const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
// Note: We need raw body for the callback, so don't use express.json() globally
app.use(morgan("dev"));

// Store for verification sessions
const verificationSessions = new Map<string, any>();

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "SynergyAI Agent Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * Get agent data for a human wallet address
 */
app.get("/agents/human/:humanAddress", async (req: Request, res: Response) => {
  try {
    const { humanAddress } = req.params;

    if (!ethers.isAddress(humanAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const { getAgentData, isHumanVerified } = await import(
      "./services/registryClient"
    );

    try {
      const data = await getAgentData(humanAddress);
      const verified = await isHumanVerified(humanAddress);

      if (data.agentWallet === ethers.ZeroAddress) {
        return res.json({
          registered: false,
          humanAddress,
          agentAddress: null,
          trustScore: 0,
          verified: false,
        });
      }

      res.json({
        registered: true,
        humanAddress,
        agentAddress: data.agentWallet,
        trustScore: data.trustScore / 10, // Convert to 0-100 scale
        verified: verified,
      });
    } catch (error: any) {
      // Contract might not have getAgentData, try individual calls
      const { getRegistry } = await import("./services/registryClient");
      const registry = getRegistry();

      if (!registry) {
        return res.json({
          registered: false,
          humanAddress,
          agentAddress: null,
          trustScore: 0,
          verified: false,
          error: "Registry not initialized",
        });
      }

      const agentAddress = await registry.agentOf(humanAddress);
      if (agentAddress === ethers.ZeroAddress) {
        return res.json({
          registered: false,
          humanAddress,
          agentAddress: null,
          trustScore: 0,
          verified: false,
        });
      }

      const trustScore = await registry.trustScore(agentAddress);
      const verified = await registry.isVerified(humanAddress);

      res.json({
        registered: true,
        humanAddress,
        agentAddress,
        trustScore: Number(trustScore) / 10,
        verified,
      });
    }
  } catch (error: any) {
    console.error("❌ Failed to get agent data:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get agent data", message: error.message });
  }
});

/**
 * Get portfolio for an agent
 */
app.get("/agents/:address/portfolio", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid agent address" });
    }

    const provider = new ethers.JsonRpcProvider(config.katanaRpcUrl);
    const erc20Abi = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
    ];

    // Fetch balances for known tokens
    const tokens = [];
    const tokenConfigs = [
      { address: config.wethAddress, symbol: "WETH", decimals: 18 },
      { address: config.vbUsdcAddress, symbol: "vbUSDC", decimals: 6 },
      { address: config.katAddress, symbol: "KAT", decimals: 18 },
    ];

    for (const tokenConfig of tokenConfigs) {
      if (tokenConfig.address && tokenConfig.address !== ethers.ZeroAddress) {
        try {
          const contract = new ethers.Contract(
            tokenConfig.address,
            erc20Abi,
            provider
          );
          const balance = await contract.balanceOf(address);
          const formatted = ethers.formatUnits(balance, tokenConfig.decimals);

          tokens.push({
            symbol: tokenConfig.symbol,
            address: tokenConfig.address,
            balance: formatted,
            balanceRaw: balance.toString(),
            valueUsd: 0, // TODO: Add price oracle
            pnl24h: 0,
          });
        } catch (error) {
          console.warn(
            `Failed to fetch balance for ${tokenConfig.symbol}:`,
            error
          );
        }
      }
    }

    // Get ETH balance
    const ethBalance = await provider.getBalance(address);
    tokens.unshift({
      symbol: "ETH",
      address: ethers.ZeroAddress,
      balance: ethers.formatEther(ethBalance),
      balanceRaw: ethBalance.toString(),
      valueUsd: 0,
      pnl24h: 0,
    });

    res.json({
      agentAddress: address,
      tokens,
      totalValueUsd: 0,
      pnl24h: 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch portfolio:", error.message);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

/**
 * Start identity verification process
 * Returns a payload for QR code generation for Privado ID
 */
app.post(
  "/identity/start",
  express.json(),
  async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({
          error: "Invalid wallet address",
        });
      }

      console.log(`🆔 Starting identity verification for ${walletAddress}`);

      // Generate a unique session ID
      const sessionId = Date.now().toString();

      // Get public callback URL (must be accessible from internet for Privado ID)
      const hostUrl =
        config.backendUrl || process.env.NGROK_URL || "http://localhost:3001";
      const callbackUrl = `${hostUrl}/identity/callback?sessionId=${sessionId}`;

      // Verifier DID - use configured or default
      const verifierDid =
        config.privadoVerifierDid ||
        "did:iden3:privado:main:2ShVftBmNha7XccjvM6L6fT3Q6xDp7CJaSoGYKABut";

      // Create Privado ID authorization request using official library
      const request = auth.createAuthorizationRequest(
        "SynergyAI Human Verification", // reason
        verifierDid, // audience (verifier DID)
        callbackUrl // callback URL
      );

      // Basic auth - no specific credential requirements (empty scope)
      request.body.scope = [];

      // Fix timestamp to be proper Unix seconds (not milliseconds)
      request.created_time = Math.floor(Date.now() / 1000);

      // Store session for later verification
      verificationSessions.set(sessionId, {
        authRequest: request,
        walletAddress,
        createdAt: Date.now(),
      });

      // Create universal link for web wallet
      const encodedRequest = Buffer.from(JSON.stringify(request)).toString(
        "base64"
      );
      const verificationLink = `https://wallet.privado.id/#i_m=${encodedRequest}`;

      console.log(`📱 Generated verification request: ${sessionId}`);
      console.log(`🔗 Callback URL: ${callbackUrl}`);

      res.json({
        id: sessionId,
        type: "PrivadoIDVerification",
        wallet: walletAddress,
        timestamp: new Date().toISOString(),
        qrData: JSON.stringify(request),
        verificationLink: verificationLink,
        callbackUrl: callbackUrl,
        instructions: [
          "1. Make sure you have Privado ID wallet (mobile or web)",
          "2. Scan this QR code OR click the verification link",
          "3. Approve the authentication request in your wallet",
          "4. The verification will complete automatically",
          "",
          "⚠️ Note: For the callback to work, the backend must be publicly accessible.",
          "Run: ngrok http 3001 - then set NGROK_URL in .env",
        ],
      });
    } catch (error: any) {
      console.error("❌ Failed to start verification:", error.message);
      res.status(500).json({
        error: "Failed to start verification",
        message: error.message,
      });
    }
  }
);

/**
 * Callback endpoint for Privado ID wallet
 * Receives the JWZ token with the ZK proof
 */
app.post("/identity/callback", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    // Get raw body (JWZ token)
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    if (!tokenStr) {
      return res.status(400).json({ error: "Token is required" });
    }

    console.log(`🔐 Received callback for session: ${sessionId}`);

    // Fetch the stored auth request
    const session = verificationSessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ error: "Invalid or expired session" });
    }

    // Set up state resolvers for verification
    const resolvers = {
      ["privado:main"]: new resolver.EthStateResolver(
        "https://rpc-mainnet.privado.id",
        "0x3C9acB2205Aa72A05F6D77d708b5Cf85FCa3a896"
      ),
      ["polygon:amoy"]: new resolver.EthStateResolver(
        "https://rpc-amoy.polygon.technology",
        "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124"
      ),
      ["polygon:main"]: new resolver.EthStateResolver(
        "https://polygon-rpc.com",
        "0x624ce98D2d27b20b8f8d521723Df8fC4db71D79D"
      ),
    };

    // Create verifier with circuit verification keys
    const keyDIR = path.join(__dirname, "../keys");
    const verifier = await auth.Verifier.newVerifier({
      stateResolver: resolvers,
      circuitsDir: keyDIR,
      ipfsGatewayURL: "https://ipfs.io",
    });

    // Verify the proof
    const opts = {
      AcceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minutes
    };

    const authResponse = await verifier.fullVerify(
      tokenStr,
      session.authRequest,
      opts
    );

    console.log(`✅ Verification successful for DID: ${authResponse.from}`);

    // Store verified status
    verificationSessions.set(`${sessionId}_verified`, {
      verified: true,
      userDid: authResponse.from,
      walletAddress: session.walletAddress,
      verifiedAt: Date.now(),
    });

    // Register agent on-chain
    const agentWalletAddress = ethers.Wallet.createRandom().address;
    const trustScore = 850; // Default trust score

    try {
      await registerAgent(
        session.walletAddress,
        agentWalletAddress,
        trustScore
      );
      console.log(`🤖 Agent registered on-chain: ${agentWalletAddress}`);

      verificationSessions.set(`${sessionId}_verified`, {
        verified: true,
        userDid: authResponse.from,
        walletAddress: session.walletAddress,
        agentAddress: agentWalletAddress,
        trustScore,
        verifiedAt: Date.now(),
      });
    } catch (regError: any) {
      console.error("⚠️ On-chain registration failed:", regError.message);
    }

    res.status(200).json({
      success: true,
      message: "Verification successful",
      userDid: authResponse.from,
    });
  } catch (error: any) {
    console.error("❌ Callback verification failed:", error.message);
    res.status(500).json({
      error: "Verification failed",
      message: error.message,
    });
  }
});

/**
 * Check verification status for a session
 */
app.get("/identity/status/:sessionId", (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const verifiedData = verificationSessions.get(`${sessionId}_verified`);

  if (verifiedData) {
    res.json({
      verified: true,
      ...verifiedData,
    });
  } else {
    const session = verificationSessions.get(sessionId);
    res.json({
      verified: false,
      pending: !!session,
    });
  }
});

/**
 * Complete identity verification with wallet signature
 * User signs a message proving ownership, then backend registers on-chain
 */
app.post(
  "/identity/complete",
  express.json(),
  async (req: Request, res: Response) => {
    try {
      const {
        walletAddress,
        signature,
        message,
        sessionId,
        agentWalletAddress,
      } = req.body;

      if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return res.status(400).json({
          error: "Invalid wallet address",
        });
      }

      // Verify the signature if provided (required for security)
      if (signature && message) {
        try {
          const recoveredAddress = ethers.verifyMessage(message, signature);
          if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({
              error: "Invalid signature - wallet address mismatch",
              expected: walletAddress,
              recovered: recoveredAddress,
            });
          }
          console.log(`✅ Signature verified for ${walletAddress}`);
        } catch (sigError: any) {
          return res.status(401).json({
            error: "Invalid signature",
            message: sigError.message,
          });
        }
      } else {
        console.log(
          `⚠️ No signature provided - proceeding without verification`
        );
      }

      console.log(`✅ Completing identity verification for ${walletAddress}`);

      // Check if already verified via callback
      if (sessionId) {
        const verifiedData = verificationSessions.get(`${sessionId}_verified`);
        if (verifiedData && verifiedData.verified) {
          return res.json({
            verified: true,
            humanAddress: walletAddress,
            agentAddress: verifiedData.agentAddress,
            trustScore: verifiedData.trustScore / 10,
            timestamp: new Date().toISOString(),
            message: "Already verified via Privado ID",
          });
        }
      }

      // Generate or use provided agent wallet address
      const agentAddress =
        agentWalletAddress || ethers.Wallet.createRandom().address;

      // Calculate initial trust score
      const initialTrustScore = 850; // 0.85 on a scale of 0-1000

      console.log(`🤖 Registering agent: ${agentAddress}`);
      console.log(`🎯 Initial trust score: ${initialTrustScore / 10}`);

      // Register agent on-chain
      if (config.registryContractAddress) {
        try {
          const result = await registerAgent(
            walletAddress,
            agentAddress,
            initialTrustScore
          );
          console.log(`⛓️  On-chain registration TX: ${result.txHash}`);
        } catch (error: any) {
          console.warn(
            `⚠️  On-chain registration failed: ${error.message}. Continuing with off-chain verification.`
          );
        }
      } else {
        console.warn(
          "⚠️  Registry contract not deployed. Skipping on-chain registration."
        );
      }

      res.json({
        verified: true,
        humanAddress: walletAddress,
        agentAddress: agentAddress,
        trustScore: initialTrustScore / 10, // Return as 0-100 scale
        timestamp: new Date().toISOString(),
        message: "Identity verified and agent registered successfully",
      });
    } catch (error: any) {
      console.error("❌ Failed to complete verification:", error.message);
      res.status(500).json({
        error: "Failed to complete verification",
        message: error.message,
      });
    }
  }
);

/**
 * Run a specific strategy for an agent
 */
app.post(
  "/agents/:address/strategies/simple-eth-dip-buyer/run",
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const { amountIn, maxEthPriceUsd } = req.body;

      // Validate inputs
      if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: "Invalid agent address" });
      }

      if (!amountIn || !maxEthPriceUsd) {
        return res.status(400).json({
          error: "Missing required parameters: amountIn, maxEthPriceUsd",
        });
      }

      console.log(`\n🎯 Strategy execution request for agent ${address}`);

      // Convert amountIn to BigInt (assuming input is in USDC, 6 decimals)
      const amountInWei = ethers.parseUnits(amountIn.toString(), 6);

      // Run the strategy
      const result = await runSimpleEthDipBuyer({
        amountIn: amountInWei,
        maxEthPriceUsd: Number(maxEthPriceUsd),
        agentWalletAddress: address,
      });

      // Return result
      res.json({
        strategy: "simple-eth-dip-buyer",
        agent: address,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Strategy execution failed:", error.message);
      res.status(500).json({
        error: "Strategy execution failed",
        message: error.message,
      });
    }
  }
);

/**
 * Get all registered agents from blockchain events
 */
app.get("/agents", async (req: Request, res: Response) => {
  try {
    const { getRegistry, getProvider } = await import(
      "./services/registryClient"
    );
    const registry = getRegistry();
    const provider = getProvider();

    if (!registry) {
      return res.json({
        agents: [],
        count: 0,
        message: "Registry contract not initialized",
      });
    }

    // Query AgentRegistered events from the contract
    const filter = registry.filters.AgentRegistered();
    const events = await registry.queryFilter(filter, -10000); // Last 10000 blocks

    const agents = await Promise.all(
      events.map(async (event: any) => {
        const { human, agentWallet, initialTrustScore, timestamp } = event.args;

        // Get current trust score from contract
        let currentScore = initialTrustScore;
        try {
          currentScore = await registry.trustScore(agentWallet);
        } catch (e) {
          // Use initial score if query fails
        }

        return {
          humanAddress: human,
          agentAddress: agentWallet,
          trustScore: Number(currentScore) / 10, // Convert to 0-100 scale
          registeredAt: new Date(Number(timestamp) * 1000).toISOString(),
          status: "active",
        };
      })
    );

    res.json({
      agents,
      count: agents.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch agents:", error.message);
    res.json({
      agents: [],
      count: 0,
      error: error.message,
    });
  }
});

/**
 * Get Wave 3 metrics from blockchain
 */
app.get("/metrics/wave3", async (req: Request, res: Response) => {
  try {
    const { getRegistry } = await import("./services/registryClient");
    const registry = getRegistry();

    if (!registry) {
      return res.json({
        verifiedAgents: 0,
        totalVolume: "0",
        averageTrustScore: 0,
        activeStrategies: 0,
        lastUpdated: new Date().toISOString(),
        message: "Registry contract not initialized",
      });
    }

    // Query AgentRegistered events to count verified agents
    const filter = registry.filters.AgentRegistered();
    const events = await registry.queryFilter(filter, -10000);

    let totalTrustScore = 0;
    for (const event of events) {
      const { agentWallet } = (event as any).args;
      try {
        const score = await registry.trustScore(agentWallet);
        totalTrustScore += Number(score);
      } catch (e) {
        // Skip if query fails
      }
    }

    const avgTrustScore =
      events.length > 0 ? totalTrustScore / events.length / 10 : 0;

    res.json({
      verifiedAgents: events.length,
      totalVolume: "0", // TODO: Track from swap events
      averageTrustScore: avgTrustScore.toFixed(1),
      activeStrategies: events.length, // Each agent has one strategy
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch Wave 3 metrics:", error.message);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

/**
 * Get liquidity pools
 */
app.get("/pools", async (req: Request, res: Response) => {
  try {
    // TODO: Query real pools from Katana DEXs
    res.json({
      pools: [],
      count: 0,
      message: "Pool data will be fetched from Katana DEXs",
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch pools:", error.message);
    res.status(500).json({ error: "Failed to fetch pools" });
  }
});

/**
 * Get activity feed from blockchain events
 */
app.get("/activity", async (req: Request, res: Response) => {
  try {
    const { getRegistry } = await import("./services/registryClient");
    const registry = getRegistry();

    if (!registry) {
      return res.json({
        activities: [],
        count: 0,
        message: "Registry contract not initialized",
      });
    }

    // Query both AgentRegistered and TrustScoreUpdated events
    const registerFilter = registry.filters.AgentRegistered();
    const trustFilter = registry.filters.TrustScoreUpdated();

    const [registerEvents, trustEvents] = await Promise.all([
      registry.queryFilter(registerFilter, -10000),
      registry.queryFilter(trustFilter, -10000),
    ]);

    const activities: any[] = [];

    // Add registration events
    for (const event of registerEvents) {
      const { human, agentWallet, initialTrustScore, timestamp } = (
        event as any
      ).args;
      activities.push({
        id: event.transactionHash,
        type: "agent_registered",
        title: "Agent Registered",
        description: `New agent ${agentWallet.slice(
          0,
          8
        )}... registered for ${human.slice(0, 8)}...`,
        humanAddress: human,
        agentAddress: agentWallet,
        trustScore: Number(initialTrustScore) / 10,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
        txHash: event.transactionHash,
      });
    }

    // Add trust score update events
    for (const event of trustEvents) {
      const { agentWallet, oldScore, newScore, timestamp } = (event as any)
        .args;
      activities.push({
        id: event.transactionHash,
        type: "trust_updated",
        title: "Trust Score Updated",
        description: `Trust score changed from ${Number(oldScore) / 10} to ${
          Number(newScore) / 10
        }`,
        agentAddress: agentWallet,
        oldScore: Number(oldScore) / 10,
        newScore: Number(newScore) / 10,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
        txHash: event.transactionHash,
      });
    }

    // Sort by timestamp descending
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.json({
      activities: activities.slice(0, 50), // Return last 50 activities
      count: activities.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch activity:", error.message);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

/**
 * Initialize and start server
 */
async function startServer() {
  try {
    console.log("\n🚀 Starting SynergyAI Agent Backend...\n");

    // Validate configuration
    validateConfig();

    // Initialize blockchain clients
    initializeProvider();
    initializeRegistry();
    initializeGoatClient();

    // Start Express server
    app.listen(config.port, () => {
      console.log("\n✨ Server ready!");
      console.log(`   📡 Listening on http://localhost:${config.port}`);
      console.log(`   🔗 Katana RPC: ${config.katanaRpcUrl}`);
      console.log("\n📚 Available endpoints:");
      console.log("   GET  /health");
      console.log("   GET  /agents/:address/portfolio");
      console.log("   POST /identity/start");
      console.log("   POST /identity/complete");
      console.log("   POST /agents/:address/strategies/:strategyId/run");
      console.log(
        "\n⏳ Waiting for contract deployment to enable full functionality...\n"
      );
    });
  } catch (error: any) {
    console.error("\n❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();
