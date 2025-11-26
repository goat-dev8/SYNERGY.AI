import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";

/**
 * Connect Wallet Button Component
 *
 * Wrapper around RainbowKit's ConnectButton with custom styling
 * to match the SynergyAI cyberpunk theme.
 */

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Loading state
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // Not connected
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="glass-card hover-glitch px-4 py-2"
                    variant="outline"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              // Wrong network
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    variant="outline"
                  >
                    Wrong Network
                  </Button>
                );
              }

              // Connected - show account info
              return (
                <div className="flex items-center gap-2">
                  {/* Chain switcher */}
                  <Button
                    onClick={openChainModal}
                    variant="ghost"
                    size="sm"
                    className="glass-card px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {chain.hasIcon && (
                        <div
                          className="w-4 h-4 rounded-full overflow-hidden"
                          style={{
                            background: chain.iconBackground,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="w-4 h-4"
                            />
                          )}
                        </div>
                      )}
                      <span className="font-mono">{chain.name}</span>
                    </div>
                  </Button>

                  {/* Account button */}
                  <Button
                    onClick={openAccountModal}
                    className="glass-card hover-glitch px-4 py-2 font-mono"
                    variant="outline"
                  >
                    <div className="flex items-center gap-2">
                      {account.displayBalance && (
                        <span className="text-xs text-muted-foreground">
                          {account.displayBalance}
                        </span>
                      )}
                      <span className="font-semibold">
                        {account.displayName}
                      </span>
                    </div>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default ConnectWalletButton;
