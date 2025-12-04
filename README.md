# Bridged-EASY-Contracts
🍹 Sharing a slice of the EASY life

## Solana Token Setup with Fireblocks

Complete implementation for deploying and interacting with Solana tokens using Fireblocks SDK.

## Prerequisites

1. **Fireblocks API Setup**
   - Generate RSA 4096 key pair and CSR
   - Create API user in Fireblocks Console
   - Obtain API key and private key
   - Whitelist IP addresses (if required)

2. **Required Information**
   - Vault Account ID (default: `0`)
   - Asset ID: `SOL_TEST` (Testnet) or `SOL` (Mainnet)
   - Vault must hold enough SOL for transaction fees and rent-exempt balances

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Fireblocks credentials:
```
FIREBLOCKS_API_KEY=your_api_key_here
FIREBLOCKS_SECRET_KEY=your_private_key_here
FIREBLOCKS_BASE_PATH=US
VAULT_ACCOUNT_ID=0
ASSET_ID=SOL_TEST
NETWORK=testnet
```

## Usage

### Deploy a Token

```bash
npm run deploy
```

This will deploy a new Solana Token 2022 with default parameters:
- Name: "My Solana Token"
- Symbol: "MST"
- Decimals: 9

### Mint Tokens

```bash
npm run mint <tokenLinkId> <recipientAddress> [amount]
```

Example:
```bash
npm run mint abc123 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 1000000000
```

### Transfer Tokens

```bash
npm run transfer <tokenLinkId> <sourceAddress> <destinationAddress> [amount]
```

Example:
```bash
npm run transfer abc123 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 500000000
```

### Deploy Reflective Token

A reflective token automatically redistributes fees to holders using transfer fees:

```bash
npm run reflective deploy [name] [symbol] [decimals] [feeBasisPoints] [maxFee]
```

Example:
```bash
npm run reflective deploy "Reflective Token" REFL 9 100 1000000000
```

This creates a basic token. To configure transfer fees:

```bash
npm run reflective set-transfer-fee <tokenLinkId> <feeBasisPoints> <maxFee>
```

Example:
```bash
npm run reflective set-transfer-fee abc123 100 1000000000
```

This configures:
- 1% transfer fee (100 basis points)
- Maximum fee of 1 token (1000000000 with 9 decimals)

### Set Transfer Hook (for Reflective Token)

To implement custom redistribution logic, set a transfer hook:

```bash
npm run reflective set-hook <tokenLinkId> <hookProgramId>
```

### Check Token Status

```bash
npm run dev token-status <tokenLinkId>
```

### Check Transaction Status

```bash
npm run dev tx-status <txId>
```

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── fireblocks.ts      # Fireblocks SDK initialization
│   ├── deploy.ts              # Token deployment
│   ├── mint.ts                # Mint tokens
│   ├── transfer.ts            # Transfer tokens
│   ├── reflective-token.ts    # Reflective token deployment
│   └── index.ts               # Status checking utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Reflective Token Implementation

Reflective tokens use Token 2022 extensions:
- **Transfer Fee Config**: Collects fees on each transfer
- **Transfer Hook**: Executes custom logic (redistribution) on transfers

The transfer hook program must be deployed separately and handle the redistribution logic.

## Build

```bash
npm run build
```

## References

- [Fireblocks Developer Portal](https://developers.fireblocks.com/)
- [Deploying and Interacting with Solana Tokens](https://developers.fireblocks.com/reference/deploying-and-interacting-with-solana-tokens)
- [Interact with Solana Programs](https://developers.fireblocks.com/reference/interact-with-solana-programs)
