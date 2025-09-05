// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./SToken.sol";

contract Monitoring {
    SToken public immutable S_TOKEN;
    
    // Payment required for each analysis (1 S token)
    uint256 public constant ANALYSIS_PAYMENT = 1 * 10**18; // 1 S token
    
    // Events
    event MonitoringRequested(address indexed user, string targetAddress, uint256 payment);
    event MonitoringCompleted(address indexed user, string targetAddress, uint256 riskScore, string analysis);
    event AlertTriggered(address indexed user, string targetAddress, string alertType, string message);
    event PaymentReceived(address indexed user, uint256 amount);
    error Unauthorized();
    error InsufficientSTokens();
    error InvalidTargetAddress();
    
    // Structs
    struct MonitoringRequest {
        address user;
        string targetAddress;
        uint256 payment;
        bool completed;
        uint256 riskScore;
        string analysis;
        uint256 timestamp;
        bool isActive;
    }
    
    // State variables
    mapping(address => MonitoringRequest[]) public userRequests;
    address public owner;
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    modifier requireSTokens() {
        if (!S_TOKEN.hasEnoughForFeature(msg.sender)) revert InsufficientSTokens();
        _;
    }

    constructor(address sTokenAddress) {
        S_TOKEN = SToken(sTokenAddress);
        owner = msg.sender;
    }

    /**
     * @dev Initialize the contract with S token authorization
     */
    function initialize() external onlyOwner {
        // This will be called after deployment to authorize this contract to use S tokens
        // The owner needs to call S_TOKEN.authorizeContract(address(this), true)
    }
    
    /**
     * @dev Request monitoring service - requires payment for each analysis
     * @param targetAddress The address to monitor
     */
    function requestMonitoring(string memory targetAddress) external requireSTokens {
        if (bytes(targetAddress).length == 0) revert InvalidTargetAddress();
        
        // Use 1 S token for the monitoring
        S_TOKEN.useFeature(msg.sender, ANALYSIS_PAYMENT);
        
        // Create monitoring request
        MonitoringRequest memory newRequest = MonitoringRequest({
            user: msg.sender,
            targetAddress: targetAddress,
            payment: ANALYSIS_PAYMENT,
            completed: false,
            riskScore: 0,
            analysis: "",
            timestamp: block.timestamp,
            isActive: true
        });
        
        userRequests[msg.sender].push(newRequest);
        
        emit MonitoringRequested(msg.sender, targetAddress, ANALYSIS_PAYMENT);
        emit PaymentReceived(msg.sender, ANALYSIS_PAYMENT);
    }
    
    /**
     * @dev Complete monitoring analysis (called by owner/backend)
     * @param user The user who requested the monitoring
     * @param requestIndex Index of the request in user's requests array
     * @param riskScore The calculated risk score (0-100)
     * @param analysis The analysis report
     */
    function completeAnalysis(
        address user,
        uint256 requestIndex,
        uint256 riskScore,
        string memory analysis
    ) external onlyOwner {
        require(requestIndex < userRequests[user].length, "Invalid request index");
        require(!userRequests[user][requestIndex].completed, "Analysis already completed");
        
        userRequests[user][requestIndex].completed = true;
        userRequests[user][requestIndex].riskScore = riskScore;
        userRequests[user][requestIndex].analysis = analysis;
        
        emit MonitoringCompleted(
            user,
            userRequests[user][requestIndex].targetAddress,
            riskScore,
            analysis
        );
    }
    
    /**
     * @dev Trigger an alert for a monitored address
     * @param user The user to alert
     * @param requestIndex Index of the request
     * @param alertType Type of alert (e.g., "High Risk", "Suspicious Activity")
     * @param message Alert message
     */
    function triggerAlert(
        address user,
        uint256 requestIndex,
        string memory alertType,
        string memory message
    ) external onlyOwner {
        require(requestIndex < userRequests[user].length, "Invalid request index");
        require(userRequests[user][requestIndex].isActive, "Monitoring not active");
        
        emit AlertTriggered(
            user,
            userRequests[user][requestIndex].targetAddress,
            alertType,
            message
        );
    }
    
    /**
     * @dev Stop monitoring for a specific request
     * @param requestIndex Index of the request to stop monitoring
     */
    function stopMonitoring(uint256 requestIndex) external {
        require(requestIndex < userRequests[msg.sender].length, "Invalid request index");
        require(userRequests[msg.sender][requestIndex].isActive, "Monitoring already stopped");
        
        userRequests[msg.sender][requestIndex].isActive = false;
    }
    
    /**
     * @dev Get user's monitoring requests
     * @param user The user address
     * @return Array of monitoring requests
     */
    function getUserRequests(address user) external view returns (MonitoringRequest[] memory) {
        return userRequests[user];
    }
    

    
    /**
     * @dev Get S token balance of this contract
     */
    function getContractSTokenBalance() external view returns (uint256) {
        return S_TOKEN.balanceOf(address(this));
    }
    
    /**
     * @dev Get user's S token balance
     */
    function getUserSTokenBalance(address user) external view returns (uint256) {
        return S_TOKEN.balanceOf(user);
    }
    
    /**
     * @dev Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
    
    /**
     * @dev Get the S token address
     */
    function getSTokenAddress() external view returns (address) {
        return address(S_TOKEN);
    }
}
