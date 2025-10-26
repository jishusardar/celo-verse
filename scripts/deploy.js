async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const SimplePayout = await ethers.getContractFactory("SimplePayout");
  const contract = await SimplePayout.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
  console.log("\nSend CELO to this address to fund it!");
  
  // Save address
  require('fs').writeFileSync(
    'contract-address.txt',
    address
  );
}

main().catch(console.error);
