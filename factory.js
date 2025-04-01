import web3 from "./web3";
import CampaignFactory from "./artifacts/contracts/Campaign.sol/CampaignFactory.json";

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    '0x9D23080C0e3341e6018563BBb609551E9aBaf4D4'
);

export default instance;