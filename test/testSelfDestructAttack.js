const { expect, assert } = require("chai");
const { formatEther } = require("ethers/lib/utils");
const { waffle } = require("hardhat");


describe('SelfDestruct Attack', async () => {

  let Attack; //ArimeticOverflowAttack
  let attack;

  let AttackFixed;
  let attackFixed;

  let EtherGame;
  let etherGame;
  
  let depositValue;
  let userArray = []; //const [deployer, Alice, Bob, Matias]

  beforeEach(async () => {
    userArray = await ethers.getSigners();

    EtherGame = await ethers.getContractFactory("EtherGame");
    etherGame = await EtherGame.deploy();
    await etherGame.deployed();

    depositValue = ethers.utils.parseUnits('1', 'ether');

 
    Attack = await ethers.getContractFactory("SelfDestructAttack");
    attack = await Attack.deploy(etherGame.address)
    await attack.deployed()

  })    

  it('shows the normal flow with the coding error', async () => {
  
    await etherGame.connect(userArray[10]).deposit({value: depositValue})
    await etherGame.connect(userArray[11]).deposit({value: depositValue})
    await etherGame.connect(userArray[12]).deposit({value: depositValue})
    await etherGame.connect(userArray[13]).deposit({value: depositValue})
    await etherGame.connect(userArray[14]).deposit({value: depositValue})

    await etherGame.connect(userArray[14]).claimReward()


    const provider = waffle.provider;
    const attack_balance = (await provider.getBalance(attack.address)).toString();
    console.log('attack contract balance: ', attack_balance);

    let balances = []
    balances[0] = await userArray[10].getBalance()
    balances[1] = await userArray[11].getBalance()
    balances[2] = await userArray[12].getBalance()
    balances[3] = await userArray[13].getBalance()
    balances[4] = await userArray[14].getBalance()

    console.log('user balance: ', formatEther(balances[0]))
    console.log('user balance: ', formatEther(balances[1]))
    console.log('user balance: ', formatEther(balances[2]))
    console.log('user balance: ', formatEther(balances[3]))
    console.log('user balance: ', formatEther(balances[4]))

  })

  it('shows the attack flow with the coding error', async () => {
  
    depositValue = ethers.utils.parseUnits('1', 'ether');

    await etherGame.connect(userArray[10]).deposit({value: depositValue})
    await etherGame.connect(userArray[11]).deposit({value: depositValue})
    await etherGame.connect(userArray[12]).deposit({value: depositValue})

    attackValue = ethers.utils.parseUnits('2', 'ether');


    await attack.connect(userArray[15]).attack({value: attackValue})

    // await etherGame.connect(userArray[12]).claimReward()


    const provider = waffle.provider;
    const attack_balance = (await provider.getBalance(attack.address)).toString();
    console.log('attack contract balance: ', attack_balance);

    let balances = []
    balances[0] = await userArray[10].getBalance()
    balances[1] = await userArray[11].getBalance()
    balances[2] = await userArray[12].getBalance()
    balances[3] = await userArray[13].getBalance()
    balances[4] = await userArray[14].getBalance()

    console.log('user balance: ', formatEther(balances[0]))
    console.log('user balance: ', formatEther(balances[1]))
    console.log('user balance: ', formatEther(balances[2]))
    console.log('user balance: ', formatEther(balances[3]))
    console.log('user balance: ', formatEther(balances[4]))
  })
})