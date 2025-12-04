import { createFireblocksSDK, config } from './config/fireblocks';

async function getTokenStatus(tokenLinkId: string) {
  const fireblocksSdk = createFireblocksSDK();

  const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
    id: tokenLinkId,
  });

  console.log('Token Status:', tokenLink);
  console.log('Contract Address:', tokenLink.tokenMetadata.contractAddress);
  console.log('Status:', tokenLink.status);
  
  return tokenLink;
}

async function getTransactionStatus(txId: string) {
  const fireblocksSdk = createFireblocksSDK();

  const transaction = await fireblocksSdk.transactions.getTransaction({
    txId,
  });

  console.log('Transaction Status:', transaction);
  console.log('Status:', transaction.status);
  console.log('Asset ID:', transaction.assetId);
  
  return transaction;
}

const command = process.argv[2];

if (command === 'token-status') {
  const tokenLinkId = process.argv[3];
  if (!tokenLinkId) {
    console.error('Usage: npm run dev token-status <tokenLinkId>');
    process.exit(1);
  }
  getTokenStatus(tokenLinkId).catch(console.error);
} else if (command === 'tx-status') {
  const txId = process.argv[3];
  if (!txId) {
    console.error('Usage: npm run dev tx-status <txId>');
    process.exit(1);
  }
  getTransactionStatus(txId).catch(console.error);
} else {
  console.log('Available commands:');
  console.log('  token-status <tokenLinkId> - Get token deployment status');
  console.log('  tx-status <txId> - Get transaction status');
  console.log('\nConfiguration:');
  console.log('  Vault Account ID:', config.vaultAccountId);
  console.log('  Asset ID:', config.assetId);
  console.log('  Network:', config.network);
}

