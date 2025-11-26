import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";

/**
 * Contract ABIs
 */
const REGISTRY_ABI = [
  {
    inputs: [{ name: "human", type: "address" }],
    name: "agentOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentWallet", type: "address" }],
    name: "trustScore",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "human", type: "address" }],
    name: "isVerified",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Hook to fetch agent wallet address for connected user
 */
export function useAgentWallet() {
  const { address } = useAccount();
  const registryAddress = import.meta.env
    .VITE_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;

  const { data: agentAddress, isLoading } = useReadContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: "agentOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!registryAddress,
    },
  });

  return {
    agentAddress: agentAddress as string | undefined,
    isLoading,
  };
}

/**
 * Hook to fetch portfolio for an agent wallet
 */
export function usePortfolio(agentAddress?: string) {
  return useQuery({
    queryKey: ["portfolio", agentAddress],
    queryFn: async () => {
      if (!agentAddress) return null;
      const response = await apiClient.get(`/agents/${agentAddress}/portfolio`);
      return response.data;
    },
    enabled: !!agentAddress,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Hook to fetch all registered agents from registry
 */
export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await apiClient.get("/agents");
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch agent data for a specific human wallet
 */
export function useHumanAgent(humanAddress?: string) {
  return useQuery({
    queryKey: ["human-agent", humanAddress],
    queryFn: async () => {
      if (!humanAddress) return null;
      const response = await apiClient.get(`/agents/human/${humanAddress}`);
      return response.data;
    },
    enabled: !!humanAddress,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Hook to fetch token balance
 */
export function useTokenBalance(tokenAddress?: string, holderAddress?: string) {
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: holderAddress ? [holderAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!holderAddress,
    },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    balance: balance as bigint | undefined,
    decimals: decimals as number | undefined,
    symbol: symbol as string | undefined,
  };
}

/**
 * Hook to fetch Wave 3 metrics
 */
export function useWave3Metrics() {
  return useQuery({
    queryKey: ["wave3-metrics"],
    queryFn: async () => {
      const response = await apiClient.get("/metrics/wave3");
      return response.data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

/**
 * Hook to fetch activity feed
 */
export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const response = await apiClient.get("/activity");
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });
}

/**
 * Hook to fetch liquidity pools
 */
export function usePools() {
  return useQuery({
    queryKey: ["pools"],
    queryFn: async () => {
      const response = await apiClient.get("/pools");
      return response.data;
    },
    refetchInterval: 20000, // Refresh every 20 seconds
  });
}
