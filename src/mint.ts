import { createFireblocksSDK, config } from './config/fireblocks';

async function mintTokens(tokenLinkId: string, recipientAddress: string, amount: string) {
  const fireblocksSdk = createFireblocksSDK();

  const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
    id: tokenLinkId,
  });

  const idl = await fireblocksSdk.contractInteractions.getDeployedContractAbi({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
  });

  const mintToCheckedInstruction = idl.data.abi.find(
    (func: any) => func.name === 'mintToChecked'
  );

  if (!mintToCheckedInstruction) {
    throw new Error('mintToChecked instruction not found in IDL');
  }

  const vaultAddress = await fireblocksSdk.vaults.getVaultAccount({
    vaultAccountId: config.vaultAccountId,
  });

  const mintInstruction = {
    name: 'mintToChecked',
    accounts: [
      { name: 'mint', writable: true, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'token', writable: true, address: recipientAddress },
      { name: 'mintAuthority', signer: true, address: vaultAddress.assets?.find((a: any) => a.id === config.assetId)?.address || tokenLink.tokenMetadata.contractAddress },
    ],
    args: [
      { name: 'amount', type: 'u64', value: amount },
      { name: 'decimals', type: 'u8', value: 9 },
    ],
  };

  const mintResponse = await fireblocksSdk.contractInteractions.writeCallFunction({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
    writeCallFunctionDto: {
      vaultAccountId: config.vaultAccountId,
      abiFunction: mintInstruction,
    },
  });

  console.log('Minting tokens initiated:', mintResponse);
  console.log('Transaction ID:', mintResponse.id);
  
  return mintResponse;
}

const tokenLinkId = process.argv[2];
const recipientAddress = process.argv[3];
const amount = process.argv[4] || '1000000000';

if (!tokenLinkId || !recipientAddress) {
  console.error('Usage: npm run mint <tokenLinkId> <recipientAddress> [amount]');
  process.exit(1);
}

mintTokens(tokenLinkId, recipientAddress, amount).catch(console.error);

