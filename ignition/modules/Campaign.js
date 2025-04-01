const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CampaignModule = buildModule("CampaignModule", (m) => {
    // Deploy CampaignFactory terlebih dahulu
    const factory = m.contract("CampaignFactory");

    // Fungsi untuk mendapatkan ABI dan address
    const getContractData = async () => {
        const factoryContract = await factory.deployed();
        return {
            factory: {
                address: factoryContract.address,
                abi: factoryContract.interface.format('json')
            }
        };
    };

    // Export data yang diperlukan
    return {
        factory,
        getContractData
    };
});

module.exports = CampaignModule;