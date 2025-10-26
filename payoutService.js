const { ethers } = require('ethers');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = [
  "function payOne(address recipient, uint256 amount) external",
  "function payMany(address[] recipients, uint256[] amounts) external",
  "function getBalance() view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(
  "https://alfajores-forno.celo-testnet.org"
);
const wallet = new ethers.Wallet('bf1575af8e90735a70b2e7560cb9ec952f2c2e04b2107160ad996eb7fa75b3a8', provider);
const contract = new ethers.Contract('0xD03E83f260FBA8c3118B856F315eD4E38C2B3522', ABI, wallet);

// Pay one person
async function paySingle(recipientAddress, amountInCelo) {
  try {
    const amount = ethers.parseEther(amountInCelo.toString());
    const tx = await contract.payOne(recipientAddress, amount);
    await tx.wait();
    console.log(`✅ Paid ${amountInCelo} CELO to ${recipientAddress}`);
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Payment failed:', error);
    return { success: false, error: error.message };
  }
}

// Pay multiple people
async function payMultiple(recipients, amounts) {
  try {
    const weiAmounts = amounts.map(a => ethers.parseEther(a.toString()));
    const tx = await contract.payMany(recipients, weiAmounts);
    await tx.wait();
    console.log(`✅ Paid ${recipients.length} people`);
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('Batch payment failed:', error);
    return { success: false, error: error.message };
  }
}

// Check balance
async function getContractBalance() {
  const balance = await contract.getBalance();
  return ethers.formatEther(balance);
}

module.exports = { paySingle, payMultiple, getContractBalance };
