import apiClient from "@/lib/api";
import { useIdentityStore } from "@/store/identityStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Identity Verification Hook
 *
 * Manages the complete identity verification flow:
 * 1. Start verification (generate QR)
 * 2. Poll for callback completion
 * 3. Complete verification (manual fallback)
 */

interface StartVerificationRequest {
  walletAddress: string;
}

interface StartVerificationResponse {
  id: string;
  type: string;
  wallet: string;
  timestamp: string;
  qrData: string;
  verificationLink?: string;
  callbackUrl?: string;
  instructions: string[];
}

interface CompleteVerificationRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
  proof?: any;
  agentWalletAddress?: string;
}

interface CompleteVerificationResponse {
  verified: boolean;
  humanAddress: string;
  agentAddress: string;
  trustScore: number;
  timestamp: string;
  message: string;
}

interface VerificationStatusResponse {
  status: "pending" | "verified" | "failed";
  verified?: boolean;
  humanAddress?: string;
  agentAddress?: string;
  trustScore?: number;
  timestamp?: string;
  error?: string;
}

export function useIdentityVerification() {
  const queryClient = useQueryClient();
  const {
    startVerification,
    completeVerification,
    verificationInProgress,
    verificationRequestId,
  } = useIdentityStore();

  // Start verification mutation
  const startMutation = useMutation({
    mutationFn: async (data: StartVerificationRequest) => {
      const response = await apiClient.post<StartVerificationResponse>(
        "/identity/start",
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      startVerification(
        variables.walletAddress,
        data.qrData,
        data.id,
        data.verificationLink
      );
    },
  });

  // Complete verification mutation (manual fallback)
  const completeMutation = useMutation({
    mutationFn: async (data: CompleteVerificationRequest) => {
      const response = await apiClient.post<CompleteVerificationResponse>(
        "/identity/complete",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      completeVerification({
        agentAddress: data.agentAddress,
        trustScore: data.trustScore,
        timestamp: data.timestamp,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["wave3-metrics"] });
    },
  });

  // Poll for verification status when in progress
  const statusQuery = useQuery({
    queryKey: ["verification-status", verificationRequestId],
    queryFn: async () => {
      if (!verificationRequestId) return null;
      const response = await apiClient.get<VerificationStatusResponse>(
        `/identity/status/${verificationRequestId}`
      );
      return response.data;
    },
    enabled: verificationInProgress && !!verificationRequestId,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true,
  });

  // Handle successful verification from callback
  useEffect(() => {
    if (
      statusQuery.data?.status === "verified" &&
      statusQuery.data.agentAddress
    ) {
      completeVerification({
        agentAddress: statusQuery.data.agentAddress,
        trustScore: statusQuery.data.trustScore || 100,
        timestamp: statusQuery.data.timestamp || new Date().toISOString(),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["wave3-metrics"] });
    }
  }, [statusQuery.data, completeVerification, queryClient]);

  return {
    startVerification: startMutation.mutateAsync,
    completeVerification: completeMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    startError: startMutation.error,
    completeError: completeMutation.error,
    // Status polling info
    verificationStatus: statusQuery.data?.status || "pending",
    isPolling: statusQuery.isFetching,
  };
}

/**
 * Hook to access identity state
 */
export function useIdentityStatus() {
  return useIdentityStore();
}
