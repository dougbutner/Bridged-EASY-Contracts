import { Fireblocks, BasePath } from '@fireblocks/ts-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export function createFireblocksSDK(): Fireblocks {
  const apiKey = process.env.FIREBLOCKS_API_KEY;
  const secretKey = process.env.FIREBLOCKS_SECRET_KEY;
  const basePath = process.env.FIREBLOCKS_BASE_PATH === 'EU' ? BasePath.EU : BasePath.US;

  if (!apiKey || !secretKey) {
    throw new Error('FIREBLOCKS_API_KEY and FIREBLOCKS_SECRET_KEY must be set in .env file');
  }

  return new Fireblocks({
    apiKey,
    secretKey,
    basePath,
  });
}

export const config = {
  vaultAccountId: process.env.VAULT_ACCOUNT_ID || '0',
  assetId: process.env.ASSET_ID || 'SOL_TEST',
  network: process.env.NETWORK || 'testnet',
};

