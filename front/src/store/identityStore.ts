import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Identity Status Store
 *
 * Manages global identity verification state using Zustand.
 * Persists to localStorage so verification status survives page reloads.
 */

export interface IdentityState {
  // Verification status
  verified: boolean;
  verificationInProgress: boolean;

  // Identity data
  humanAddress: string | null;
  agentAddress: string | null;
  trustScore: number;

  // Verification request data
  verificationRequestId: string | null;
  qrData: string | null;
  verificationLink: string | null;

  // Timestamps
  lastVerificationAttempt: string | null;
  verifiedAt: string | null;

  // Actions
  startVerification: (
    humanAddress: string,
    qrData: string,
    requestId: string,
    verificationLink?: string
  ) => void;
  completeVerification: (data: {
    agentAddress: string;
    trustScore: number;
    timestamp: string;
  }) => void;
  clearVerification: () => void;
  updateTrustScore: (newScore: number) => void;
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      // Initial state
      verified: false,
      verificationInProgress: false,
      humanAddress: null,
      agentAddress: null,
      trustScore: 0,
      verificationRequestId: null,
      qrData: null,
      verificationLink: null,
      lastVerificationAttempt: null,
      verifiedAt: null,

      // Start verification
      startVerification: (humanAddress, qrData, requestId, verificationLink) =>
        set({
          verificationInProgress: true,
          humanAddress,
          qrData,
          verificationLink: verificationLink || null,
          verificationRequestId: requestId,
          lastVerificationAttempt: new Date().toISOString(),
        }),

      // Complete verification
      completeVerification: (data) =>
        set({
          verified: true,
          verificationInProgress: false,
          agentAddress: data.agentAddress,
          trustScore: data.trustScore,
          verifiedAt: data.timestamp,
          qrData: null,
          verificationRequestId: null,
        }),

      // Clear verification (logout/reset)
      clearVerification: () =>
        set({
          verified: false,
          verificationInProgress: false,
          humanAddress: null,
          agentAddress: null,
          trustScore: 0,
          verificationRequestId: null,
          qrData: null,
          verificationLink: null,
          lastVerificationAttempt: null,
          verifiedAt: null,
        }),

      // Update trust score
      updateTrustScore: (newScore) => set({ trustScore: newScore }),
    }),
    {
      name: "synergyai-identity",
    }
  )
);
