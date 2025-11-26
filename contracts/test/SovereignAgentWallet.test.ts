import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SovereignAgentWallet } from "../typechain-types";

describe("SovereignAgentWallet", function () {
  let wallet: SovereignAgentWallet;
  let owner: HardhatEthersSigner;
  let operator: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, operator, otherAccount] = await ethers.getSigners();

    const Wallet = await ethers.getContractFactory("SovereignAgentWallet");
    wallet = await Wallet.deploy(owner.address);
    await wallet.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should have zero address as initial operator", async function () {
      expect(await wallet.operator()).to.equal(ethers.ZeroAddress);
    });

    it("Should revert with invalid owner", async function () {
      const Wallet = await ethers.getContractFactory("SovereignAgentWallet");
      await expect(Wallet.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid owner"
      );
    });
  });

  describe("Operator Management", function () {
    it("Should set operator successfully", async function () {
      await expect(wallet.setOperator(operator.address))
        .to.emit(wallet, "OperatorChanged")
        .withArgs(
          ethers.ZeroAddress,
          operator.address,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp + 1)
        );

      expect(await wallet.operator()).to.equal(operator.address);
    });

    it("Should update operator successfully", async function () {
      await wallet.setOperator(operator.address);

      await expect(wallet.setOperator(otherAccount.address))
        .to.emit(wallet, "OperatorChanged")
        .withArgs(
          operator.address,
          otherAccount.address,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp + 1)
        );

      expect(await wallet.operator()).to.equal(otherAccount.address);
    });

    it("Should revert if called by non-owner", async function () {
      await expect(
        wallet.connect(otherAccount).setOperator(operator.address)
      ).to.be.revertedWithCustomError(wallet, "OnlyOwner");
    });

    it("Should revert with invalid operator address", async function () {
      await expect(wallet.setOperator(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid operator"
      );
    });
  });

  describe("Transaction Execution", function () {
    let mockContract: any;

    beforeEach(async function () {
      // Deploy a mock contract for testing
      const MockContract = await ethers.getContractFactory("MockContract");
      mockContract = await MockContract.deploy();
      await mockContract.waitForDeployment();

      // Set operator
      await wallet.setOperator(operator.address);

      // Fund the wallet
      await owner.sendTransaction({
        to: await wallet.getAddress(),
        value: ethers.parseEther("1.0"),
      });
    });

    it("Should execute transaction successfully", async function () {
      const data = mockContract.interface.encodeFunctionData("setValue", [42]);

      await expect(
        wallet
          .connect(operator)
          .execute(await mockContract.getAddress(), 0, data)
      ).to.emit(wallet, "Executed");

      expect(await mockContract.value()).to.equal(42);
    });

    it("Should revert if called by non-operator", async function () {
      const data = mockContract.interface.encodeFunctionData("setValue", [42]);

      await expect(
        wallet
          .connect(otherAccount)
          .execute(await mockContract.getAddress(), 0, data)
      ).to.be.revertedWithCustomError(wallet, "OnlyOperator");
    });

    it("Should revert with invalid target", async function () {
      await expect(
        wallet.connect(operator).execute(ethers.ZeroAddress, 0, "0x")
      ).to.be.revertedWith("Invalid target");
    });

    it("Should revert if execution fails", async function () {
      const data = mockContract.interface.encodeFunctionData("revertFunction");

      await expect(
        wallet
          .connect(operator)
          .execute(await mockContract.getAddress(), 0, data)
      ).to.be.revertedWithCustomError(wallet, "ExecutionFailed");
    });
  });

  describe("Batch Execution", function () {
    let mockContract: any;

    beforeEach(async function () {
      const MockContract = await ethers.getContractFactory("MockContract");
      mockContract = await MockContract.deploy();
      await mockContract.waitForDeployment();

      await wallet.setOperator(operator.address);

      await owner.sendTransaction({
        to: await wallet.getAddress(),
        value: ethers.parseEther("1.0"),
      });
    });

    it("Should execute batch transactions successfully", async function () {
      const targets = [
        await mockContract.getAddress(),
        await mockContract.getAddress(),
      ];
      const values = [0, 0];
      const datas = [
        mockContract.interface.encodeFunctionData("setValue", [42]),
        mockContract.interface.encodeFunctionData("setValue", [100]),
      ];

      await wallet.connect(operator).executeBatch(targets, values, datas);

      expect(await mockContract.value()).to.equal(100); // Last value set
    });

    it("Should revert with array length mismatch", async function () {
      const targets = [await mockContract.getAddress()];
      const values = [0, 0];
      const datas = ["0x"];

      await expect(
        wallet.connect(operator).executeBatch(targets, values, datas)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("ETH Handling", function () {
    it("Should receive ETH", async function () {
      const amount = ethers.parseEther("1.0");

      await owner.sendTransaction({
        to: await wallet.getAddress(),
        value: amount,
      });

      expect(await wallet.getBalance()).to.equal(amount);
    });

    it("Should return correct balance", async function () {
      const amount = ethers.parseEther("2.5");

      await owner.sendTransaction({
        to: await wallet.getAddress(),
        value: amount,
      });

      expect(
        await ethers.provider.getBalance(await wallet.getAddress())
      ).to.equal(amount);
    });
  });
});

// Mock contract for testing
const MockContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockContract {
    uint256 public value;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
    
    function revertFunction() external pure {
        revert("Mock revert");
    }
}
`;
