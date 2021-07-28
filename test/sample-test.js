const { expect, assert } = require("chai");
/*
describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
*/
describe("ReentrancyAttack", function () {
  it("Attack contract balance should be 3, ant eathStore contract balance should be 0 because all balance should have been stolen", async function () {
    const [deployer, Alice, Bob, Matias] = await ethers.getSigners();

    const EtherStore = await ethers.getContractFactory("EtherStore");
    const etherStore = await EtherStore.deploy();
    await etherStore.deployed();

    const depositValue = ethers.utils.parseUnits('1', 'ether');
    await etherStore.connect(Alice).deposit({value: depositValue});
    await etherStore.connect(Bob).deposit({value: depositValue});
 
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(etherStore.address)
    await attack.deployed()

    await attack.connect(Matias).attack({value: depositValue})

    let balances = []
    balances[0] = (await etherStore.balances(Matias.address)).toString();
    balances[1] = (await etherStore.balances(Alice.address)).toString();
    balances[2] = (await etherStore.balances(Bob.address)).toString();

    let attackContractBalance = (await attack.getBalance()).toString();
    console.log('ether store contract balance: ', (await etherStore.getBalance()).toString() )
    console.log('attack contract balance: ', attackContractBalance)
    console.log('Matias: ', (await Matias.getBalance()).toString() , await Matias.address)
    console.log('Alice: ', (await Alice.getBalance()).toString(), Alice.address)
    console.log('Bob: ', (await Bob.getBalance()).toString(), Bob.address)


    assert.equal(attackContractBalance, ethers.utils.parseUnits('3', 'ether'));      
  });
});