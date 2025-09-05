# SonicGuardian Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** or compatible wallet
3. **Sonic Testnet S tokens** for gas fees
4. **Private key** for deployment account

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas reporting
REPORT_GAS=true
```

2. Get Sonic Testnet S tokens from the faucet:
   - Visit: https://faucet.soniclabs.com
   - Connect your wallet
   - Request testnet S tokens

## Network Configuration

- **Network Name**: Sonic Testnet
- **RPC URL**: https://rpc.testnet.soniclabs.com
- **Chain ID**: 14601
- **Currency Symbol**: S
- **Explorer**: https://testnet.soniclabs.com

## Deployment Steps

1. **Install Dependencies**:
```bash
npm install
```

2. **Compile Contracts**:
```bash
npx hardhat compile
```

3. **Deploy to Sonic Testnet**:
```bash
npx hardhat run scripts/deploy-sonic.ts --network sonic
```

4. **Verify Deployment**:
   - Check the console output for contract addresses
   - Verify contracts on Sonic explorer
   - Test contract functionality

## Contract Addresses

After deployment, the following contracts will be deployed:

- **SToken**: The S token contract for feature payments
- **ContractAnalysis**: Smart contract analysis service
- **Tokenomics**: Tokenomics analysis service  
- **SocialAnalysis**: Social sentiment analysis service
- **Monitoring**: Real-time monitoring service
- **Universal**: Universal messaging contract

## Post-Deployment Setup

1. **Update Configuration Files**:
   - Update `contract-addresses.json` with deployed addresses
   - Update frontend `constants/contracts.ts` with new addresses

2. **Authorize Contracts**:
   - The deployment script automatically authorizes all contracts to use S tokens
   - Verify authorization by checking the SToken contract

3. **Mint Test Tokens**:
   - The deployment script mints 1000 S tokens to the deployer
   - Distribute S tokens to test users as needed

## Testing

1. **Test S Token Functions**:
```bash
npx hardhat run scripts/test-stoken.ts --network sonic
```

2. **Test Feature Contracts**:
```bash
npx hardhat run scripts/test-features.ts --network sonic
```

## Frontend Integration

1. **Update Chain Configuration**:
   - Sonic Testnet is already configured in `frontend/src/constants/chains.ts`
   - Update contract addresses in `frontend/src/constants/contracts.ts`

2. **Test Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure you have enough S tokens for gas fees
2. **Network Issues**: Verify RPC URL and network configuration
3. **Contract Authorization**: Ensure all contracts are authorized to use S tokens

### Support

- Check Sonic documentation: https://docs.soniclabs.com
- Join Sonic Discord: https://discord.gg/soniclabs
- Report issues on GitHub

## Security Notes

- Never commit private keys to version control
- Use testnet for development and testing only
- Verify all contract interactions before mainnet deployment
- Keep private keys secure and use hardware wallets for production
