import { createFireblocksSDK, config } from './config/fireblocks';

interface ReflectiveTokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  transferFeeBasisPoints: number;
  maxFee: string;
}

async function deployReflectiveToken(tokenConfig: ReflectiveTokenConfig) {
  const fireblocksSdk = createFireblocksSDK();

  const deployResponse = await fireblocksSdk.tokenization.issueNewToken({
    createTokenRequestDto: {
      vaultAccountId: config.vaultAccountId,
      createParams: {
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
      },
      assetId: config.assetId,
    },
  });

  console.log('Token deployment initiated:', deployResponse);
  console.log('Token Link ID:', deployResponse.id);
  console.log('\nNote: To configure transfer fees for a reflective token,');
  console.log('you must use the setTransferFeeConfig instruction after deployment.');
  console.log('Use: npm run reflective set-transfer-fee <tokenLinkId> <feeBasisPoints> <maxFee>');
  
  return deployResponse;
}

async function setTransferFeeConfig(
  tokenLinkId: string,
  transferFeeBasisPoints: number,
  maxFee: string
) {
  const fireblocksSdk = createFireblocksSDK();

  const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
    id: tokenLinkId,
  });

  const idl = await fireblocksSdk.contractInteractions.getDeployedContractAbi({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
  });

  const setTransferFeeConfigInstruction = idl.data.abi.find(
    (func: any) => func.name === 'setTransferFeeConfig'
  );

  if (!setTransferFeeConfigInstruction) {
    throw new Error('setTransferFeeConfig instruction not found in IDL');
  }

  const instruction = {
    name: 'setTransferFeeConfig',
    accounts: [
      { name: 'mint', writable: true, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'configAuthority', signer: true, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'feeConfigAuthority', writable: false, address: tokenLink.tokenMetadata.contractAddress },
    ],
    args: [
      {
        name: 'transferFeeConfig',
        type: 'struct',
        value: {
          transferFeeConfigAuthority: null,
          withdrawWithheldAuthority: null,
          withheldAmount: '0',
          olderTransferFee: {
            epoch: 0,
            maximumFee: maxFee,
            transferFeeBasisPoints: transferFeeBasisPoints,
          },
          newerTransferFee: {
            epoch: 0,
            maximumFee: maxFee,
            transferFeeBasisPoints: transferFeeBasisPoints,
          },
        },
      },
    ],
  };

  const response = await fireblocksSdk.contractInteractions.writeCallFunction({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
    writeCallFunctionDto: {
      vaultAccountId: config.vaultAccountId,
      abiFunction: instruction,
    },
  });

  console.log('Transfer fee config set:', response);
  return response;
}

async function setTransferHook(tokenLinkId: string, hookProgramId: string) {
  const fireblocksSdk = createFireblocksSDK();

  const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
    id: tokenLinkId,
  });

  const idl = await fireblocksSdk.contractInteractions.getDeployedContractAbi({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
  });

  const setTransferHookInstruction = idl.data.abi.find(
    (func: any) => func.name === 'setTransferHook'
  );

  if (!setTransferHookInstruction) {
    throw new Error('setTransferHook instruction not found in IDL');
  }

  const instruction = {
    name: 'setTransferHook',
    accounts: [
      { name: 'mint', writable: true, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'authority', signer: true, address: tokenLink.tokenMetadata.contractAddress },
      { name: 'transferHookProgramId', writable: false, address: hookProgramId },
    ],
    args: [],
  };

  const response = await fireblocksSdk.contractInteractions.writeCallFunction({
    contractAddress: tokenLink.tokenMetadata.contractAddress,
    baseAssetId: config.assetId,
    writeCallFunctionDto: {
      vaultAccountId: config.vaultAccountId,
      abiFunction: instruction,
    },
  });

  console.log('Transfer hook set:', response);
  return response;
}

const command = process.argv[2];

if (command === 'deploy') {
  const tokenConfig: ReflectiveTokenConfig = {
    name: process.argv[3] || 'Reflective Token',
    symbol: process.argv[4] || 'REFL',
    decimals: parseInt(process.argv[5]) || 9,
    transferFeeBasisPoints: parseInt(process.argv[6]) || 100,
    maxFee: process.argv[7] || '1000000000',
  };

  deployReflectiveToken(tokenConfig).catch(console.error);
} else if (command === 'set-transfer-fee') {
  const tokenLinkId = process.argv[3];
  const feeBasisPoints = parseInt(process.argv[4]);
  const maxFee = process.argv[5];

  if (!tokenLinkId || isNaN(feeBasisPoints) || !maxFee) {
    console.error('Usage: npm run reflective set-transfer-fee <tokenLinkId> <feeBasisPoints> <maxFee>');
    process.exit(1);
  }

  setTransferFeeConfig(tokenLinkId, feeBasisPoints, maxFee).catch(console.error);
} else if (command === 'set-hook') {
  const tokenLinkId = process.argv[3];
  const hookProgramId = process.argv[4];

  if (!tokenLinkId || !hookProgramId) {
    console.error('Usage: npm run reflective set-hook <tokenLinkId> <hookProgramId>');
    process.exit(1);
  }

  setTransferHook(tokenLinkId, hookProgramId).catch(console.error);
} else {
  console.error('Usage:');
  console.error('  Deploy: npm run reflective deploy [name] [symbol] [decimals] [feeBasisPoints] [maxFee]');
  console.error('  Set Transfer Fee: npm run reflective set-transfer-fee <tokenLinkId> <feeBasisPoints> <maxFee>');
  console.error('  Set Hook: npm run reflective set-hook <tokenLinkId> <hookProgramId>');
  process.exit(1);
}

