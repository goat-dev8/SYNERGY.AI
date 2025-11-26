import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  useIdentityStatus,
  useIdentityVerification,
} from "@/hooks/useIdentity";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Database,
  Eye,
  Fingerprint,
  Loader2,
  Lock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Identity() {
  const { address, isConnected } = useAccount();
  const [showComplete, setShowComplete] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const { signMessageAsync } = useSignMessage();

  const {
    verified,
    verificationInProgress,
    trustScore,
    qrData,
    verificationLink,
    agentAddress,
    verifiedAt,
  } = useIdentityStatus();

  const {
    startVerification,
    completeVerification,
    isStarting,
    isCompleting,
    verificationStatus,
    isPolling,
  } = useIdentityVerification();

  const handleGenerateQR = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await startVerification({ walletAddress: address });
      toast.success("Verification started! Sign with your wallet to complete.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to start verification"
      );
    }
  };

  const handleCompleteVerification = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSigning(true);
    try {
      // Create a message for the user to sign
      const timestamp = Date.now();
      const message = `SynergyAI Identity Verification\n\nI authorize the registration of my sovereign AI agent.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature proves ownership of this wallet.`;

      // Request signature from user's wallet
      toast.info("Please sign the message in your wallet...");
      const signature = await signMessageAsync({ message });

      // Send to backend with signature
      await completeVerification({
        walletAddress: address,
        signature,
        message,
      });

      toast.success("Identity verified and agent registered on-chain!");
      setShowComplete(false);
    } catch (error: any) {
      if (error.message?.includes("rejected")) {
        toast.error("Signature rejected - verification cancelled");
      } else {
        toast.error(
          error.response?.data?.error || error.message || "Verification failed"
        );
      }
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold mb-2">Sovereign Identity</h1>
          <p className="text-muted-foreground">
            Zero-knowledge proof of humanity without sacrificing privacy.
          </p>
        </motion.div>

        {/* Your Profile */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-destructive" />
              <h2 className="text-2xl font-bold">Your Sovereign Profile</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Identity Status
                  </div>
                  <StatusBadge status={verified ? "active" : "error"}>
                    {verified ? "Verified Human" : "Unverified Human"}
                  </StatusBadge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Trust Score
                  </div>
                  <div
                    className={`text-3xl font-bold font-mono ${
                      verified ? "text-success" : "text-destructive"
                    }`}
                  >
                    {(trustScore / 10).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Last Proof Time
                  </div>
                  <div className="text-sm font-mono">
                    {verifiedAt
                      ? new Date(verifiedAt).toLocaleString()
                      : "Never"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Agent Wallet
                  </div>
                  <div className="text-sm font-mono">
                    {agentAddress
                      ? `${agentAddress.slice(0, 6)}...${agentAddress.slice(
                          -4
                        )}`
                      : "Not deployed"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className={`w-48 h-48 rounded-xl border flex items-center justify-center ${
                    verified
                      ? "bg-success/10 border-success/30"
                      : "bg-muted/20 border-border/50"
                  }`}
                >
                  <div className="text-center">
                    {verified ? (
                      <>
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-success" />
                        <div className="text-sm text-success">Verified</div>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-16 h-16 mx-auto mb-2 opacity-50 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          Not verified
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Verify with Privado ID */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="w-8 h-8 text-secondary" />
              <h2 className="text-2xl font-bold">Verify Your Identity</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4">
                  Web-Based Verification (Dev Mode)
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium mb-1 text-primary">
                          Hackathon Development Mode
                        </div>
                        <div className="text-muted-foreground">
                          For production: Integrate with Privado ID Issuer +
                          Verifier infrastructure. This demo simulates ZK
                          verification flow entirely in-browser for testing.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        Connect Your Wallet
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ensure your wallet is connected to Katana network
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        Start Verification Process
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Click to initiate identity verification request
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        Complete Registration
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Finalize on-chain registration and deploy your agent
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 glow-cyan"
                  size="lg"
                  onClick={handleGenerateQR}
                  disabled={
                    !isConnected ||
                    isStarting ||
                    verified ||
                    verificationInProgress
                  }
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 mr-2" />
                      {verified
                        ? "Already Verified"
                        : verificationInProgress
                        ? "Verification Started"
                        : "Start Verification"}
                    </>
                  )}
                </Button>

                {verificationInProgress && (
                  <Button
                    className="w-full mt-3 glow-purple"
                    size="lg"
                    onClick={handleCompleteVerification}
                    disabled={isCompleting || isSigning}
                  >
                    {isSigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sign in Wallet...
                      </>
                    ) : isCompleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering On-Chain...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Sign & Register Agent On-Chain
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="w-64 h-64 rounded-xl bg-white/5 border border-border/50 flex items-center justify-center p-4">
                  {verificationInProgress ? (
                    <div className="text-center">
                      {isPolling && (
                        <div className="absolute top-2 right-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      )}
                      <div className="w-32 h-32 rounded-full bg-success/20 border-2 border-success/50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Shield className="w-16 h-16 text-success" />
                      </div>
                      <div className="text-lg font-bold mb-2">
                        {verificationStatus === "pending"
                          ? "Waiting for Verification"
                          : verificationStatus === "verified"
                          ? "Verified!"
                          : "Verification Ready"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {verificationLink ? (
                          <a
                            href={verificationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Open Privado ID Web Wallet →
                          </a>
                        ) : (
                          "Scan QR code with Privado ID app"
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Or click "Complete Verification" for manual registration
                      </div>
                    </div>
                  ) : verified ? (
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-success/20 border-2 border-success/50 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-16 h-16 text-success" />
                      </div>
                      <div className="text-lg font-bold mb-2 text-success">
                        Verified!
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your agent is deployed and active
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <div className="text-6xl mb-2">🔐</div>
                      <div className="text-sm">
                        Click "Start Verification" to begin
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="text-sm text-success/90">
                  <div className="font-medium mb-1">
                    Zero-Knowledge Privacy Protection
                  </div>
                  <div>
                    In production mode, Privado ID (Polygon ID) would verify
                    your humanity via ZK proofs without revealing personal data.
                    This demo simulates the flow for hackathon testing.
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* What We Prove */}
        <motion.div variants={item}>
          <h2 className="text-2xl font-bold mb-4">What We Prove</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">You're a Unique Human</h3>
              <p className="text-sm text-muted-foreground">
                Zero-knowledge proofs confirm you're not a bot or duplicate
                account
              </p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold mb-2">Your Risk Score Passes</h3>
              <p className="text-sm text-muted-foreground">
                Verification confirms you meet the minimum trust threshold
              </p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 border border-success/50 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-bold mb-2">No Data On-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Your personal information never touches the blockchain
              </p>
            </GlassCard>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
