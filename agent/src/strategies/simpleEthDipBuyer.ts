import axios from "axios";
import { ethers } from "ethers";
import { config } from "../config";

/**
 * Simple ETH Dip Buyer Strategy
 *
 * Buys WETH with vbUSDC on Katana when ETH price dips below threshold
 *
 * Strategy Logic:
 * 1. Fetch current ETH price from price feed
 * 2. If price <= maxEthPriceUsd, execute swap
 * 3. Use Sushi router on Katana for swap
 * 4. Apply 1% slippage tolerance
 */

export interface SimpleEthDipBuyerParams {
  amountIn: bigint; // vbUSDC amount to swap (18 decimals)
  maxEthPriceUsd: number; // Maximum ETH price to execute buy
  agentWalletAddress: string; // Agent wallet that will receive WETH
}

export interface SimpleEthDipBuyerResult {
  executed: boolean;
  txHash?: string;
  reason?: string;
  ethPrice?: number;
  amountOut?: string;
}

/**
 * Fetch current ETH price from CoinGecko API
 */
async function fetchEthPrice(): Promise<number> {
  const priceFeedUrl =
    config.priceFeedUrl || "https://api.coingecko.com/api/v3/simple/price";

  try {
    const response = await axios.get(priceFeedUrl, {
      params: {
        ids: "ethereum",
        vs_currencies: "usd",
      },
      timeout: 5000,
    });

    const price = response.data?.ethereum?.usd;
    if (!price) {
      throw new Error("Invalid price response from API");
    }

    return price;
  } catch (error) {
    console.error("❌ Failed to fetch ETH price:", error);
    throw new Error(
      `Price feed error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Calculate minimum output amount with slippage
 */
function calculateMinAmountOut(
  amountIn: bigint,
  ethPrice: number,
  slippagePercent: number = 1
): bigint {
  // amountIn is in vbUSDC (assume 6 decimals like USDC)
  // WETH has 18 decimals
  // ETH price is in USD

  // Convert amountIn to USD value (divide by 10^6 for USDC decimals)
  const usdValue = Number(amountIn) / 1e6;

  // Calculate WETH amount: usdValue / ethPrice
  const wethAmount = usdValue / ethPrice;

  // Convert to WETH decimals (18) and apply slippage
  const wethAmountWei = BigInt(Math.floor(wethAmount * 1e18));
  const slippageFactor = BigInt(100 - slippagePercent);
  const minAmountOut = (wethAmountWei * slippageFactor) / 100n;

  return minAmountOut;
}

/**
 * Execute swap on Sushi router
 */
async function executeSwap(
  amountIn: bigint,
  minAmountOut: bigint,
  recipient: string
): Promise<string> {
  // TODO: Get actual token addresses from environment or Katana tokenlist
  const VBUSDC_ADDRESS = config.vbUsdcAddress || ethers.ZeroAddress; // Placeholder
  const WETH_ADDRESS = config.wethAddress || ethers.ZeroAddress; // Placeholder

  if (
    VBUSDC_ADDRESS === ethers.ZeroAddress ||
    WETH_ADDRESS === ethers.ZeroAddress
  ) {
    throw new Error(
      "Token addresses not configured. Set VBUSDC_ADDRESS and WETH_ADDRESS in .env"
    );
  }

  // Initialize provider and signer
  const provider = new ethers.JsonRpcProvider(config.katanaRpcUrl);
  const signer = new ethers.Wallet(config.agentPrivateKey, provider);

  // Sushi V2 Router ABI (minimal for swapExactTokensForTokens)
  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  ];

  const router = new ethers.Contract(
    config.sushiRouterAddress,
    routerAbi,
    signer
  );

  // Approve router to spend vbUSDC
  const tokenAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];
  const vbUsdcToken = new ethers.Contract(VBUSDC_ADDRESS, tokenAbi, signer);

  console.log("🔐 Checking vbUSDC allowance...");
  const currentAllowance = await vbUsdcToken.allowance(
    signer.address,
    config.sushiRouterAddress
  );

  if (currentAllowance < amountIn) {
    console.log("🔓 Approving vbUSDC for router...");
    const approveTx = await vbUsdcToken.approve(
      config.sushiRouterAddress,
      amountIn
    );
    await approveTx.wait();
    console.log("✅ Approval confirmed");
  }

  // Execute swap
  const path = [VBUSDC_ADDRESS, WETH_ADDRESS];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

  console.log("🔄 Executing swap on Sushi...");
  console.log(`  Amount In: ${ethers.formatUnits(amountIn, 6)} vbUSDC`);
  console.log(`  Min Amount Out: ${ethers.formatEther(minAmountOut)} WETH`);
  console.log(`  Recipient: ${recipient}`);

  const swapTx = await router.swapExactTokensForTokens(
    amountIn,
    minAmountOut,
    path,
    recipient,
    deadline
  );

  console.log(`📝 Swap transaction sent: ${swapTx.hash}`);
  const receipt = await swapTx.wait();
  console.log(`✅ Swap confirmed in block ${receipt.blockNumber}`);

  return swapTx.hash;
}

/**
 * Run the Simple ETH Dip Buyer strategy
 */
export async function runSimpleEthDipBuyer(
  params: SimpleEthDipBuyerParams
): Promise<SimpleEthDipBuyerResult> {
  const { amountIn, maxEthPriceUsd, agentWalletAddress } = params;

  console.log("🤖 Running Simple ETH Dip Buyer Strategy");
  console.log(`  Max ETH Price: $${maxEthPriceUsd}`);
  console.log(`  Amount In: ${ethers.formatUnits(amountIn, 6)} vbUSDC`);

  try {
    // Step 1: Fetch current ETH price
    console.log("📊 Fetching current ETH price...");
    const ethPrice = await fetchEthPrice();
    console.log(`  Current ETH Price: $${ethPrice.toFixed(2)}`);

    // Step 2: Check if price is below threshold
    if (ethPrice > maxEthPriceUsd) {
      const reason = `ETH price ($${ethPrice.toFixed(
        2
      )}) is above threshold ($${maxEthPriceUsd})`;
      console.log(`⏸️  ${reason}`);
      return {
        executed: false,
        reason,
        ethPrice,
      };
    }

    console.log("✅ Price threshold met! Executing buy...");

    // Step 3: Calculate minimum output with slippage
    const minAmountOut = calculateMinAmountOut(amountIn, ethPrice, 1);

    // Step 4: Execute swap
    const txHash = await executeSwap(
      amountIn,
      minAmountOut,
      agentWalletAddress
    );

    const amountOut = ethers.formatEther(minAmountOut);
    console.log(`🎉 Strategy executed successfully!`);
    console.log(`  TX: ${txHash}`);
    console.log(`  Bought ~${amountOut} WETH`);

    return {
      executed: true,
      txHash,
      ethPrice,
      amountOut,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Strategy execution failed:", errorMessage);

    return {
      executed: false,
      reason: `Execution error: ${errorMessage}`,
    };
  }
}
