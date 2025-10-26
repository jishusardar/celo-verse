// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimplePayout {
    address public owner;
    
    event PaymentSent(address indexed recipient, uint256 amount);
    event FundsReceived(address indexed from, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // Pay one person
    function payOne(address recipient, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Transfer failed");
        emit PaymentSent(recipient, amount);
    }
    
    // Pay multiple people at once
    function payMany(address[] memory recipients, uint256[] memory amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(address(this).balance >= amounts[i], "Insufficient balance");
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(success, "Transfer failed");
            emit PaymentSent(recipients[i], amounts[i]);
        }
    }
    
    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Deposit funds (anyone can deposit)
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
