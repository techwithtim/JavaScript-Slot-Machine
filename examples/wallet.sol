pragma solidity ^0.8.2;

// This example was taken from the code examples on:
// https://ethereum.org/en/

/**
NOTE: THIS WILL NOT BE AUTOMATICALLY COMPILED.
If you want it to compile, either import it into contract.sol or copy and paste the contract directly into there!
**/

contract SimpleWallet {
    // An 'address' is comparable to an email address - it's used to identify an account on Ethereum.
    address payable private owner;

    // Events allow for logging of activity on the blockchain.
    // Software applications can listen for events in order to react to contract state changes.
    event LogDeposit(uint amount, address indexed sender);
    event LogWithdrawal(uint amount, address indexed recipient);

  // When this contract is deployed, set the deploying address as the owner of the contract.
    constructor() {
        owner = payable(msg.sender);
    }

    // Send ETH from the function caller to the SimpleWallet contract
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH.");
        emit LogDeposit(msg.value, msg.sender);
    }

    // Send ETH from the SimpleWallet contract to a chosen recipient
    function withdraw(uint amount, address payable recipient) public {
        require(msg.sender == owner, "Only the owner of this wallet can withdraw.");
        require(address(this).balance >= amount, "Not enough funds.");
        emit LogWithdrawal(amount, recipient);
        recipient.transfer(amount);
    }
}
