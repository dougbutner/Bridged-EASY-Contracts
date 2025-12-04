# Fireblocks Solana Token Setup Guide

## Overview

Fireblocks automates Solana Token 2022 deployment and management. Unlike EVM networks, Solana token issuance does **not** require uploading contract templates. Fireblocks SDK handles Token 2022 program deployment automatically.

## Prerequisites

### 1. Fireblocks API Setup

- Generate RSA 4096 key pair and CSR
- Create API user in Fireblocks Console
- Obtain API key and private key
- Whitelist IP addresses (if required)

### 2. Required Information

- **Asset ID**: `SOL_TEST` (Testnet) or `SOL` (Mainnet)
- **Vault Account ID**: Vault that will deploy/manage the token
- **Vault must hold enough SOL** for transaction fees and rent-exempt balances

> ⚠️ **Warning**: The deploying vault receives all Token 2022 extension authorities (transferable later via `setAuthority`).

## Step 1: Install Fireblocks TypeScript SDK

```bash
npm install @fireblocks/ts-sdk
# or
yarn add @fireblocks/ts-sdk
```

## Step 2: Initialize Fireblocks SDK

```typescript
import { Fireblocks, BasePath } from '@fireblocks/ts-sdk';

const fireblocksSdk = new Fireblocks({
  apiKey: 'YOUR_API_KEY',
  secretKey: 'YOUR_PRIVATE_KEY',
  basePath: BasePath.US, // Use BasePath.EU if applicable
});
```

## Step 3: Issue a New Solana Token

```typescript
const deployResponse = await fireblocksSdk.tokenization.issueNewToken({
  createTokenRequestDto: {
    vaultAccountId: '0', // Vault account ID that will manage the token
    createParams: {
      name: 'My Solana Token',
      symbol: 'MST',
      decimals: 9, // Solana tokens typically use 9 decimals
    },
    assetId: 'SOL_TEST', // or 'SOL' for Mainnet
  },
});

console.log('Token deployment initiated:', deployResponse);
```

**Response**: Returns `TokenLinkDto` with token reference. Monitor status: `PENDING` → `COMPLETED` or `FAILED` via token link endpoint.

## Step 4: Interact with Token (Minting Example)

### 4.1 Fetch Token's IDL

```typescript
const tokenLink = await fireblocksSdk.tokenization.getLinkedToken({
  id: deployResponse.id,
});

const idl = await fireblocksSdk.contractInteractions.getDeployedContractAbi({
  contractAddress: tokenLink.tokenMetadata.contractAddress,
  baseAssetId: 'SOL_TEST',
});
```

### 4.2 Create Mint Instruction

```typescript
const mintToCheckedInstruction = idl.data.abi.find(
  (func) => func.name === 'mintToChecked'
);

const mintInstruction = {
  name: 'mintToChecked',
  accounts: [
    { name: 'mint', writable: true, address: 'MINT_ADDRESS' },
    { name: 'token', writable: true, address: 'RECIPIENT_TOKEN_ACCOUNT_ADDRESS' },
    { name: 'mintAuthority', signer: true, address: 'YOUR_MINT_AUTHORITY_ADDRESS' },
  ],
  args: [
    { name: 'amount', type: 'u64', value: '1000000000' },
    { name: 'decimals', type: 'u8', value: 9 },
  ],
};
```

> 📘 **Note**: If recipient lacks a token account, Fireblocks can create one when you pass the base asset wallet address.

### 4.3 Execute Mint Transaction

```typescript
const mintResponse = await fireblocksSdk.contractInteractions.writeCallFunction({
  contractAddress: tokenLink.tokenMetadata.contractAddress,
  baseAssetId: 'SOL_TEST',
  writeCallFunctionDto: {
    vaultAccountId: '0',
    abiFunction: mintInstruction,
  },
});

console.log('Minting tokens initiated:', mintResponse);
```

Poll the returned **Fireblocks Transaction ID** for status.

## Supported Token 2022 Extensions

- **Metadata** – Attach and update metadata
- **Transfer hook** – Execute custom logic per transfer
- **Metadata pointer** – Reference external metadata sources
- **Interest bearing** – Accrue interest over time
- **Default account state** – Set default token account state
- **Mint close authority** – Securely close the mint account
- **Transfer fee config** – Apply dynamic transfer fees
- **Permanent delegate** – Assign a permanent delegate

## Limitations

- Deploying vault receives all extension authorities (transfer with `setAuthority` if needed)
- Tokenization does not support custom data types or string encoding in IDL
- For custom types/strings, serialize program data and submit via `Transactions API`

## Reflective Token Contract

**Note**: Reflective token contracts (auto-redistribute fees to holders) are possible using:

- **Transfer fee config** extension for fee collection
- **Transfer hook** extension for custom distribution logic
- Integration with Fireblocks for secure key management

## Key Fireblocks Endpoints

- **Issue Token**: `POST /v1/tokenization/tokens`
- **Get Token Link**: `GET /v1/tokenization/tokens/{id}`
- **Get Contract ABI**: `GET /v1/contracts/{contractAddress}/abi`
- **Write Call Function**: `POST /v1/contracts/{contractAddress}/execute`
- **Get Transaction**: `GET /v1/transactions/{txId}`

## References

- [Fireblocks Developer Portal](https://developers.fireblocks.com/)
- [Deploying and Interacting with Solana Tokens](https://developers.fireblocks.com/reference/deploying-and-interacting-with-solana-tokens)
- [Interact with Solana Programs](https://developers.fireblocks.com/reference/interact-with-solana-programs)
