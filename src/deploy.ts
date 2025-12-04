import { createFireblocksSDK, config } from './config/fireblocks';

async function deployToken() {
  const fireblocksSdk = createFireblocksSDK();

  const deployResponse = await fireblocksSdk.tokenization.issueNewToken({
    createTokenRequestDto: {
      vaultAccountId: config.vaultAccountId,
      createParams: {
        name: 'My Solana Token',
        symbol: 'MST',
        decimals: 9,
      },
      assetId: config.assetId,
    },
  });

  console.log('Token deployment initiated:', deployResponse);
  console.log('Token Link ID:', deployResponse.id);
  
  return deployResponse;
}

deployToken().catch(console.error);

