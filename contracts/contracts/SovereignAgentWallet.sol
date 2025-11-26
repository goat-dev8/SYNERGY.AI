// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SovereignAgentWallet
 * @notice Smart account wallet for autonomous AI agents
 * @dev Allows owner (human) to set operator (backend agent) who can execute strategies
 */
contract SovereignAgentWallet {
    /// @notice The human who owns this agent wallet
    address public owner;
    
    /// @notice The backend operator address that can execute transactions
    address public operator;
    
    /// @notice Emitted when a transaction is executed
    event Executed(
        address indexed target,
        uint256 value,
        bytes data,
        bytes returnData,
        uint256 timestamp
    );
    
    /// @notice Emitted when operator is changed
    event OperatorChanged(
        address indexed oldOperator,
        address indexed newOperator,
        uint256 timestamp
    );
    
    /// @notice Error thrown when caller is not owner
    error OnlyOwner(address caller);
    
    /// @notice Error thrown when caller is not operator
    error OnlyOperator(address caller);
    
    /// @notice Error thrown when execution fails
    error ExecutionFailed(address target, bytes data);
    
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwner(msg.sender);
        }
        _;
    }
    
    modifier onlyOperator() {
        if (msg.sender != operator) {
            revert OnlyOperator(msg.sender);
        }
        _;
    }
    
    /**
     * @notice Initialize the agent wallet
     * @param _owner The human owner of this agent wallet
     */
    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner");
        owner = _owner;
    }
    
    /**
     * @notice Set or update the operator address
     * @param newOperator The new operator address
     */
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        
        address oldOperator = operator;
        operator = newOperator;
        
        emit OperatorChanged(oldOperator, newOperator, block.timestamp);
    }
    
    /**
     * @notice Execute a transaction as the agent wallet
     * @param target The contract address to call
     * @param value The amount of ETH to send
     * @param data The calldata to execute
     * @return returnData The data returned from the call
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOperator returns (bytes memory returnData) {
        require(target != address(0), "Invalid target");
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        
        if (!success) {
            revert ExecutionFailed(target, data);
        }
        
        emit Executed(target, value, data, result, block.timestamp);
        
        return result;
    }
    
    /**
     * @notice Execute multiple transactions in a single call
     * @param targets Array of contract addresses to call
     * @param values Array of ETH amounts to send
     * @param datas Array of calldata to execute
     * @return returnDatas Array of data returned from each call
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyOperator returns (bytes[] memory returnDatas) {
        require(
            targets.length == values.length && values.length == datas.length,
            "Array length mismatch"
        );
        
        returnDatas = new bytes[](targets.length);
        
        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i] != address(0), "Invalid target");
            
            (bool success, bytes memory result) = targets[i].call{value: values[i]}(datas[i]);
            
            if (!success) {
                revert ExecutionFailed(targets[i], datas[i]);
            }
            
            returnDatas[i] = result;
            emit Executed(targets[i], values[i], datas[i], result, block.timestamp);
        }
        
        return returnDatas;
    }
    
    /**
     * @notice Allow the wallet to receive ETH
     */
    receive() external payable {}
    
    /**
     * @notice Fallback function
     */
    fallback() external payable {}
    
    /**
     * @notice Get the balance of this wallet
     * @return The ETH balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
