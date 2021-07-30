const { expect, assert } = require("chai");
const { waffle } = require("hardhat");

describe("ReentrancyAttack", function () {

  let Attack;
  let attack;

  let AttackFixed;
  let attackFixed;

  let EtherStore;
  let etherStore;
  let depositValue;
  let userArray = []; //const [deployer, Alice, Bob, Matias]
  beforeEach(async () => {
    userArray = await ethers.getSigners();

    EtherStore = await ethers.getContractFactory("EtherStore");
    etherStore = await EtherStore.deploy();
    await etherStore.deployed();

    depositValue = ethers.utils.parseUnits('1', 'ether');
    await etherStore.connect(userArray[1]).deposit({value: depositValue});
    await etherStore.connect(userArray[2]).deposit({value: depositValue});
 
    Attack = await ethers.getContractFactory("ReentrantAttack");
    attack = await Attack.deploy(etherStore.address)
    await attack.deployed()

    AttackFixed = await ethers.getContractFactory("ReentrantAttackFixed");
    attackFixed = await AttackFixed.deploy(etherStore.address)
    await attackFixed.deployed()

  })

  it("Attack contract balance should be 3, ant eathStore contract balance should be 0 because all balance should have been stolen", async function () {

    await attack.connect(userArray[3]).attack({value: depositValue})

    let balances = []
    balances[0] = (await etherStore.balances(userArray[3].address)).toString();
    balances[1] = (await etherStore.balances(userArray[1].address)).toString();
    balances[2] = (await etherStore.balances(userArray[2].address)).toString();

    let attackContractBalance = (await attack.getBalance()).toString();
    // console.log('ether store contract balance: ', (await etherStore.getBalance()).toString() )
    // console.log('attack contract balance: ', attackContractBalance)
    // console.log('Matias: ', (await userArray[3].getBalance()).toString() , await userArray[3].address)
    // console.log('Alice: ', (await userArray[1].getBalance()).toString(), userArray[1].address)
    // console.log('Bob: ', (await userArray[2].getBalance()).toString(), userArray[2].address)


    assert.equal(attackContractBalance, ethers.utils.parseUnits('3', 'ether'));      
  });

  // it('should throw an error attemping to make an attack because of extending from ReEntrancyGuard', async () => {

    // await expect(async () =>  await attackFixed.connect(userArray[3]).attackNonReetrant({value: depositValue})).to.be.rejected;

  //   // let balances = []
  //   // balances[0] = (await etherStore.balances(userArray[3].address)).toString();
  //   // balances[1] = (await etherStore.balances(userArray[1].address)).toString();
  //   // balances[2] = (await etherStore.balances(userArray[2].address)).toString();

  //   // let attackContractBalance = (await attackFixed.getBalance()).toString();
  //   // console.log('ether store contract balance: ', (await etherStore.getBalance()).toString() )
  //   // console.log('attack contract balance: ', attackContractBalance)
  //   // console.log('Matias: ', (await userArray[3].getBalance()).toString() , await userArray[3].address)
  //   // console.log('Alice: ', (await userArray[1].getBalance()).toString(), userArray[1].address)
  //   // console.log('Bob: ', (await userArray[2].getBalance()).toString(), userArray[2].address)



  // })
});

