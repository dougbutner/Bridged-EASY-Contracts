import { createFireblocksSDK, config } from './config/fireblocks';

async function transferTokens(
  tokenLinkId: string,
  sourceAddress: string,
  destinationAddress: string,
  amount: string
) {
  const fireblocksSdk = createFireblocksSDK();

  const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
    id: tokenLinkId,
  });

  const idl = await fireblocksSdk.contractInteractions.getDeployedContractAbi({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
  });

  const transferCheckedInstruction = idl.data.abi.find(
    (func: any) => func.name === 'transferChecked'
  );

  if (!transferCheckedInstruction) {
    throw new Error('transferChecked instruction not found in IDL');
  }

  const transferInstruction = {
    name: 'transferChecked',
    accounts: [
      { name: 'source', writable: true, address: sourceAddress },
      { name: 'mint', writable: false, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'destination', writable: true, address: destinationAddress },
      { name: 'authority', signer: true, address: sourceAddress },
    ],
    args: [
      { name: 'amount', type: 'u64', value: amount },
      { name: 'decimals', type: 'u8', value: 9 },
    ],
  };

  const transferResponse = await fireblocksSdk.contractInteractions.writeCallFunction({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
    writeCallFunctionDto: {
      vaultAccountId: config.vaultAccountId,
      abiFunction: transferInstruction,
    },
  });

  console.log('Transfer initiated:', transferResponse);
  console.log('Transaction ID:', transferResponse.id);
  
  return transferResponse;
}

const tokenLinkId = process.argv[2];
const sourceAddress = process.argv[3];
const destinationAddress = process.argv[4];
const amount = process.argv[5] || '1000000000';

if (!tokenLinkId || !sourceAddress || !destinationAddress) {
  console.error('Usage: npm run transfer <tokenLinkId> <sourceAddress> <destinationAddress> [amount]');
  process.exit(1);
}

transferTokens(tokenLinkId, sourceAddress, destinationAddress, amount).catch(console.error);

