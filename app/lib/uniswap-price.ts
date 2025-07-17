import { ethers } from 'ethers';

interface ChainConfig {
  id: number;
  name: 'ethereum' | 'polygon' | 'arbitrum';
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpc: {
    http: string;
    webSocket: string;
  };
}

export const ethereumConfig: ChainConfig = {
  id: 1,
  name: 'ethereum',
  displayName: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpc: {
    http: process.env.NEXT_PUBLIC_ETHEREUM_RPC_HTTP || 'https://mainnet.infura.io/v3/YOUR_INFURA_ID',
    webSocket: process.env.NEXT_PUBLIC_ETHEREUM_RPC_WS || 'wss://mainnet.infura.io/ws/v3/YOUR_INFURA_ID',
  },
};

export const polygonConfig: ChainConfig = {
  id: 137,
  name: 'polygon',
  displayName: 'Polygon',
  nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
  rpc: {
    http: process.env.NEXT_PUBLIC_POLYGON_RPC_HTTP || 'https://polygon-mainnet.infura.io/v3/YOUR_INFURA_ID',
    webSocket: process.env.NEXT_PUBLIC_POLYGON_RPC_WS || 'wss://polygon-mainnet.infura.io/ws/v3/YOUR_INFURA_ID',
  },
};

export const arbitrumConfig: ChainConfig = {
  id: 42161,
  name: 'arbitrum',
  displayName: 'Arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpc: {
    http: process.env.NEXT_PUBLIC_ARBITRUM_RPC_HTTP || 'https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_ID',
    webSocket: process.env.NEXT_PUBLIC_ARBITRUM_RPC_WS || 'wss://arbitrum-mainnet.infura.io/ws/v3/YOUR_INFURA_ID',
  },
};