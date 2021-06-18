import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const DECIMALS = 18;

//describe's callback cant be an async function
describe('Token', function() {
  let TokenContract;
  let YogaCoin: Contract;
  let owner: SignerWithAddress,
  addr1: SignerWithAddress,
  addr2: SignerWithAddress,
  addrs;


  beforeEach(async () => {
    [owner, addr1, addr2, addrs] = await ethers.getSigners();
    TokenContract = await ethers.getContractFactory("Token");
    YogaCoin = await TokenContract.deploy("YogaCoin", "YOGA");
    await YogaCoin.deployed();
  })

  it("Should get the balance of the contract", async function() {  
    const bal = await YogaCoin.balanceOf(owner.address);
    expect(bal).to.be.eq(ethers.utils.parseUnits("100000", "ether"));
  })

  it("Transfer ether to an address", async function() {
      //Transfer
      let transferAmount = ethers.utils.parseUnits("90", "ether");    
      await YogaCoin.transfer(addr1.address, transferAmount);
      const bal = await YogaCoin.balanceOf(addr1.address);
      expect(bal).to.be.eq(transferAmount);
  })

  it("Should emit Transfer event", async () => {
    let transferAmount = ethers.utils.parseUnits("90", "ether");   
    expect(YogaCoin.transfer(addr1.address, transferAmount))
    .to.emit(YogaCoin, "Transfer")
    .withArgs(owner.address, addr1.address, transferAmount)
  })

  it("Should revert with message", async () => {
    let transferAmount = ethers.utils.parseUnits("100001", "ether");
    //transferAmount > contract's balance
    await expect(YogaCoin.transfer(addr1.address, transferAmount)).to.be.revertedWith(
      "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
    )
  })

  it("sendTransaction changes balances of owner and receiver", async () => {
    await expect(() =>
    owner.sendTransaction({ to: addr1.address, gasPrice: 0, value:  200})
  ).to.changeEtherBalances([owner, addr1], [-200, 200])
  })

})