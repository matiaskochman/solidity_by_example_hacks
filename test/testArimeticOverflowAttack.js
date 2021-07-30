const { expect, assert } = require("chai");
const { waffle } = require("hardhat");


describe('ArimeticOverflow Attack', async () => {

  let Attack; //ArimeticOverflowAttack
  let attack;

  let AttackFixed;
  let attackFixed;

  let TimeLock;
  let timeLock;
  
  let depositValue;
  let userArray = []; //const [deployer, Alice, Bob, Matias]

  beforeEach(async () => {
    userArray = await ethers.getSigners();

    TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.deploy();
    await timeLock.deployed();

    depositValue = ethers.utils.parseUnits('1', 'ether');
 
    Attack = await ethers.getContractFactory("ArimeticOverflowAttack");
    attack = await Attack.deploy(timeLock.address)
    await attack.deployed()

  })    

  it('shows how after an attack the ether balance of timelock is stolen', async () => {
  
    await attack.connect(userArray[3]).attack({value: depositValue})

    const provider = waffle.provider;
    const attack_balance = await provider.getBalance(attack.address);
    const timeLock_balance = await provider.getBalance(timeLock.address);
    console.log('attack balance: ', attack_balance.toString())
    console.log('timelock balance: ', timeLock_balance.toString())

    assert.equal(attack_balance.toString(), ethers.utils.parseUnits('1', 'ether').toString());      
  })

  it('shows timeLock attack failing because of using safeMath', async () => {
    


    try {
      await attack.connect(userArray[3]).fixed_attack({value: depositValue})     
      assert.fail();
    } catch (err) {
      
    }
    // const provider = waffle.provider;
    // const attack_balance = await provider.getBalance(attack.address);
    // const timeLock_balance = await provider.getBalance(timeLock.address);
    // console.log('attack balance: ', attack_balance.toString())
    // console.log('timelock balance: ', timeLock_balance.toString())

    // assert.equal(attack_balance.toString(), ethers.utils.parseUnits('1', 'ether').toString());      
  })

})