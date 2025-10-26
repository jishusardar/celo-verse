// require("@nomicfoundation/hardhat-toolbox");
// require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    celoTestnet: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787
    },
    celoMainnet: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220
    }
  }
};
