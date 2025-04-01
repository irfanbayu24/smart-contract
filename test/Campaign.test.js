const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign Contract", function () {
  let CampaignFactory;
  let campaignFactory;
  let Campaign;
  let campaign;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the CampaignFactory contract
    CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    campaignFactory = await CampaignFactory.deploy();

    // Create a new campaign
    const minimumContribution = ethers.parseEther("0.01"); // 0.01 ETH
    await campaignFactory.createCampaign(minimumContribution);

    // Get the deployed campaign address
    const campaignAddress = (await campaignFactory.getDeployedCampaigns())[0];

    // Get the Campaign contract at the deployed address
    Campaign = await ethers.getContractFactory("Campaign");
    campaign = Campaign.attach(campaignAddress);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await campaign.manager()).to.equal(owner.address);
    });

    it("Should set the correct minimum contribution", async function () {
      const minContribution = await campaign.minimumContribution();
      expect(minContribution).to.equal(ethers.parseEther("0.01"));
    });
  });

  describe("Contributions", function () {
    it("Should allow valid contributions", async function () {
      // Contribute from addr1
      await campaign.connect(addr1).contribute({ 
        value: ethers.parseEther("0.02") 
      });

      // Check if addr1 is now an approver
      expect(await campaign.approvers(addr1.address)).to.be.true;
    });

    it("Should reject contributions below minimum", async function () {
      // Try to contribute less than minimum
      await expect(
        campaign.connect(addr1).contribute({ 
          value: ethers.parseEther("0.005") 
        })
      ).to.be.reverted;
    });

    it("Should track number of contributors", async function () {
      await campaign.connect(addr1).contribute({ 
        value: ethers.parseEther("0.02") 
      });
      expect(await campaign.approversCount()).to.equal(1);
    });
  });

  describe("Request Management", function () {
    const description = "Buy supplies";
    const value = ethers.parseEther("0.005");

    beforeEach(async function () {
      // First contribute some funds
      await campaign.connect(addr1).contribute({ 
        value: ethers.parseEther("0.02") 
      });
    });

    it("Should create a spending request", async function () {
      await campaign.createRequest(description, value, addr2.address);
      const request = await campaign.requests(0);
      expect(request.description).to.equal(description);
      expect(request.value).to.equal(value);
      expect(request.recipient).to.equal(addr2.address);
      expect(request.complete).to.be.false;
      expect(request.approvalCount).to.equal(0);
    });

    it("Should allow approving requests", async function () {
      await campaign.createRequest(description, value, addr2.address);
      await campaign.connect(addr1).approveRequest(0);
      const request = await campaign.requests(0);
      expect(request.approvalCount).to.equal(1);
    });

    it("Should finalize approved requests", async function () {
      await campaign.createRequest(description, value, addr2.address);
      await campaign.connect(addr1).approveRequest(0);
      
      const initialBalance = await ethers.provider.getBalance(addr2.address);
      await campaign.finalizeRequest(0);
      
      const finalBalance = await ethers.provider.getBalance(addr2.address);
      expect(finalBalance - initialBalance).to.equal(value);
    });
  });
});
