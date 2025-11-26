import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    katana: {
      url: process.env.KATANA_RPC_URL || "https://rpc.katana.network",
      chainId: 747474,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: "auto",
    },
    // Katana Testnet (Tatara)
    tatara: {
      url: "https://rpc.tatara.katana.network",
      chainId: 747475,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      katana: process.env.KATANA_EXPLORER_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "katana",
        chainId: 747474,
        urls: {
          apiURL: "https://katanascan.com/api",
          browserURL: "https://katanascan.com",
        },
      },
    ],
  },
};

export default config;
