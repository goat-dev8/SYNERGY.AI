import { Chain } from "viem";
import { env } from "./env";

/**
 * Katana Network Chain Configuration
 *
 * Katana is a Polygon CDK L2 designed for DeFi with:
 * - Chain-owned liquidity
 * - Vault Bridge for productive TVL
 * - Deep integration with Sushi and Morpho
 * - Agglayer interoperability
 */

export const katana = {
  id: env.katanaChainId,
  name: "Katana",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [env.katanaRpcUrl],
    },
    public: {
      http: [env.katanaRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "Katana Explorer",
      url: env.katanaExplorerUrl,
    },
  },
  contracts: {
    // Add important contract addresses here after deployment
    // registryContract: { address: '0x...' },
    // sushiRouter: { address: '0x...' },
  },
  testnet: env.enableTestnet,
} as const satisfies Chain;

export default katana;
