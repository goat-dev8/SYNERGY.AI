// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SovereignAgentRegistry
 * @notice Maps verified humans to their autonomous agent wallets and tracks trust scores
 * @dev Used by SynergyAI protocol to maintain human-agent relationships and reputation
 */
contract SovereignAgentRegistry is Ownable {
    /// @notice Maps human address to their agent wallet address
    mapping(address => address) public agentOf;
    
    /// @notice Maps agent wallet address to trust score (0-10000, basis points)
    mapping(address => uint256) public trustScore;
    
    /// @notice Maps human address to verification status
    mapping(address => bool) public isVerified;
    
    /// @notice Emitted when a new agent is registered
    event AgentRegistered(
        address indexed human,
        address indexed agentWallet,
        uint256 initialTrustScore,
        uint256 timestamp
    );
    
    /// @notice Emitted when trust score is updated
    event TrustScoreUpdated(
        address indexed agentWallet,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    /// @notice Error thrown when human already has an agent
    error AgentAlreadyExists(address human, address existingAgent);
    
    /// @notice Error thrown when trust score exceeds maximum
    error InvalidTrustScore(uint256 score);
    
    /// @notice Maximum trust score (100.00%)
    uint256 public constant MAX_TRUST_SCORE = 10000;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Register a new agent wallet for a verified human
     * @param human The address of the verified human
     * @param agentWallet The address of the agent's smart wallet
     * @param initialTrustScore Initial trust score (0-10000 basis points)
     */
    function registerAgent(
        address human,
        address agentWallet,
        uint256 initialTrustScore
    ) external onlyOwner {
        if (agentOf[human] != address(0)) {
            revert AgentAlreadyExists(human, agentOf[human]);
        }
        
        if (initialTrustScore > MAX_TRUST_SCORE) {
            revert InvalidTrustScore(initialTrustScore);
        }
        
        agentOf[human] = agentWallet;
        trustScore[agentWallet] = initialTrustScore;
        isVerified[human] = true;
        
        emit AgentRegistered(human, agentWallet, initialTrustScore, block.timestamp);
    }
    
    /**
     * @notice Update the trust score for an agent wallet
     * @param agentWallet The address of the agent wallet
     * @param newScore New trust score (0-10000 basis points)
     */
    function updateTrustScore(
        address agentWallet,
        uint256 newScore
    ) external onlyOwner {
        if (newScore > MAX_TRUST_SCORE) {
            revert InvalidTrustScore(newScore);
        }
        
        uint256 oldScore = trustScore[agentWallet];
        trustScore[agentWallet] = newScore;
        
        emit TrustScoreUpdated(agentWallet, oldScore, newScore, block.timestamp);
    }
    
    /**
     * @notice Get the agent wallet address for a human
     * @param human The address of the human
     * @return The agent wallet address, or address(0) if not registered
     */
    function getAgentForHuman(address human) external view returns (address) {
        return agentOf[human];
    }
    
    /**
     * @notice Get the trust score for an agent wallet
     * @param agentWallet The address of the agent wallet
     * @return The trust score (0-10000 basis points)
     */
    function getTrustScore(address agentWallet) external view returns (uint256) {
        return trustScore[agentWallet];
    }
    
    /**
     * @notice Check if a human is verified
     * @param human The address of the human
     * @return True if verified, false otherwise
     */
    function isHumanVerified(address human) external view returns (bool) {
        return isVerified[human];
    }
    
    /**
     * @notice Get all agent data for a human
     * @param human The address of the human
     * @return agent The agent wallet address
     * @return score The trust score
     * @return verified Verification status
     */
    function getAgentData(address human) external view returns (
        address agent,
        uint256 score,
        bool verified
    ) {
        agent = agentOf[human];
        score = trustScore[agent];
        verified = isVerified[human];
    }
}
