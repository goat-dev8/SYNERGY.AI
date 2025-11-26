import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SovereignAgentRegistry } from "../typechain-types";

describe("SovereignAgentRegistry", function () {
  let registry: SovereignAgentRegistry;
  let owner: HardhatEthersSigner;
  let human: HardhatEthersSigner;
  let agentWallet: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, human, agentWallet, otherAccount] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("SovereignAgentRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should have correct MAX_TRUST_SCORE", async function () {
      expect(await registry.MAX_TRUST_SCORE()).to.equal(10000);
    });
  });

  describe("Agent Registration", function () {
    it("Should register a new agent successfully", async function () {
      const initialTrustScore = 7500; // 75%

      await expect(
        registry.registerAgent(
          human.address,
          agentWallet.address,
          initialTrustScore
        )
      )
        .to.emit(registry, "AgentRegistered")
        .withArgs(
          human.address,
          agentWallet.address,
          initialTrustScore,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp + 1)
        );

      expect(await registry.agentOf(human.address)).to.equal(
        agentWallet.address
      );
      expect(await registry.trustScore(agentWallet.address)).to.equal(
        initialTrustScore
      );
      expect(await registry.isVerified(human.address)).to.be.true;
    });

    it("Should revert if trust score exceeds maximum", async function () {
      await expect(
        registry.registerAgent(human.address, agentWallet.address, 10001)
      ).to.be.revertedWithCustomError(registry, "InvalidTrustScore");
    });

    it("Should revert if human already has an agent", async function () {
      await registry.registerAgent(human.address, agentWallet.address, 5000);

      await expect(
        registry.registerAgent(human.address, otherAccount.address, 5000)
      ).to.be.revertedWithCustomError(registry, "AgentAlreadyExists");
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        registry
          .connect(otherAccount)
          .registerAgent(human.address, agentWallet.address, 5000)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Trust Score Management", function () {
    beforeEach(async function () {
      await registry.registerAgent(human.address, agentWallet.address, 5000);
    });

    it("Should update trust score successfully", async function () {
      const newScore = 8000;

      await expect(registry.updateTrustScore(agentWallet.address, newScore))
        .to.emit(registry, "TrustScoreUpdated")
        .withArgs(
          agentWallet.address,
          5000,
          newScore,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp + 1)
        );

      expect(await registry.trustScore(agentWallet.address)).to.equal(newScore);
    });

    it("Should revert if new score exceeds maximum", async function () {
      await expect(
        registry.updateTrustScore(agentWallet.address, 10001)
      ).to.be.revertedWithCustomError(registry, "InvalidTrustScore");
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        registry
          .connect(otherAccount)
          .updateTrustScore(agentWallet.address, 8000)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await registry.registerAgent(human.address, agentWallet.address, 7500);
    });

    it("Should return correct agent for human", async function () {
      expect(await registry.getAgentForHuman(human.address)).to.equal(
        agentWallet.address
      );
    });

    it("Should return zero address for unregistered human", async function () {
      expect(await registry.getAgentForHuman(otherAccount.address)).to.equal(
        ethers.ZeroAddress
      );
    });

    it("Should return correct trust score", async function () {
      expect(await registry.getTrustScore(agentWallet.address)).to.equal(7500);
    });

    it("Should return zero for unregistered agent", async function () {
      expect(await registry.getTrustScore(otherAccount.address)).to.equal(0);
    });

    it("Should return correct verification status", async function () {
      expect(await registry.isHumanVerified(human.address)).to.be.true;
      expect(await registry.isHumanVerified(otherAccount.address)).to.be.false;
    });

    it("Should return complete agent data", async function () {
      const [agent, score, verified] = await registry.getAgentData(
        human.address
      );

      expect(agent).to.equal(agentWallet.address);
      expect(score).to.equal(7500);
      expect(verified).to.be.true;
    });
  });
});
