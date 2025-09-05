import { ethers } from 'ethers';
import { SONIC_GUARDIAN_CONTRACTS } from '../constants/contracts';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  ContractAnalysis: SONIC_GUARDIAN_CONTRACTS.ContractAnalysis,
  Tokenomics: SONIC_GUARDIAN_CONTRACTS.Tokenomics,
  SocialAnalysis: SONIC_GUARDIAN_CONTRACTS.SocialAnalysis,
  Monitoring: SONIC_GUARDIAN_CONTRACTS.Monitoring,
  SToken: SONIC_GUARDIAN_CONTRACTS.SToken,
  Universal: SONIC_GUARDIAN_CONTRACTS.Universal,
};

// Network configuration
export const NETWORK_CONFIG = {
  name: "Sonic Testnet",
  rpcUrl: "https://rpc.testnet.soniclabs.com",
  chainId: 14601,
  currency: "S",
  explorer: "https://testnet.soniclabs.com",
};

// Contract ABIs (simplified for the main functions)
export const CONTRACT_ABI = [
  // Request analysis (no native value; S token is deducted inside)
  "function requestContractAnalysis(string contractAddress) external",
  "function requestTokenomicsAnalysis(string tokenAddress) external",
  "function requestSocialAnalysis(string projectName) external",
  "function requestMonitoring(string targetAddress) external",

  // Get user requests
  "function getUserRequests(address user) external view returns (tuple(address user, string contractAddress, uint256 payment, bool completed, uint256 riskScore, string analysis, uint256 timestamp)[])",

  // Introspection helpers
  "function getSTokenAddress() external view returns (address)",
  "function getContractSTokenBalance() external view returns (uint256)",
  "function getUserSTokenBalance(address user) external view returns (uint256)",
];

// Contract interaction utilities
export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      return true;
    }
    return false;
  }

  async requestContractAnalysis(contractAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ContractAnalysis,
      CONTRACT_ABI,
      this.signer
    );

    const tx = await contract.requestContractAnalysis(contractAddress);
    return await tx.wait();
  }

  async requestTokenomicsAnalysis(tokenAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.Tokenomics,
      CONTRACT_ABI,
      this.signer
    );

    const tx = await contract.requestTokenomicsAnalysis(tokenAddress);
    return await tx.wait();
  }

  async requestSocialAnalysis(projectName: string) {
    if (!this.signer) throw new Error("Wallet not connected");
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.SocialAnalysis,
      CONTRACT_ABI,
      this.signer
    );

    const tx = await contract.requestSocialAnalysis(projectName);
    return await tx.wait();
  }

  async requestMonitoring(targetAddress: string) {
    if (!this.signer) throw new Error("Wallet not connected");
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.Monitoring,
      CONTRACT_ABI,
      this.signer
    );

    const tx = await contract.requestMonitoring(targetAddress);
    return await tx.wait();
  }

  async checkPaymentStatus(contractType: 'ContractAnalysis' | 'Tokenomics' | 'SocialAnalysis' | 'Monitoring', userAddress: string) {
    if (!this.provider) throw new Error("Provider not connected");
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES[contractType],
      CONTRACT_ABI,
      this.provider
    );

    return await contract.checkPaymentStatus(userAddress);
  }

  async getUserRequests(contractType: 'ContractAnalysis' | 'Tokenomics' | 'SocialAnalysis' | 'Monitoring', userAddress: string) {
    if (!this.provider) throw new Error("Provider not connected");
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES[contractType],
      CONTRACT_ABI,
      this.provider
    );

    return await contract.getUserRequests(userAddress);
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getNetwork() {
    if (!this.provider) return null;
    return await this.provider.getNetwork();
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Utility functions
export const formatEther = (wei: bigint) => ethers.formatEther(wei);
export const parseEther = (ether: string) => ethers.parseEther(ether);

// Network switching utility
export async function switchToZetaChain() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.name,
              nativeCurrency: {
                name: NETWORK_CONFIG.currency,
                symbol: NETWORK_CONFIG.currency,
                decimals: 18
              },
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.explorer]
            }],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sonic Testnet to MetaMask:', addError);
          return false;
        }
      }
      return false;
    }
  }
  return false;
}
