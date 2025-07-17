// app/store/useAppStore.ts
import { create } from 'zustand';

// Define types for gas data and history
export interface GasPoint {
  timestamp: number; // Unix timestamp for the start of the 15-min interval
  baseFee: number; // Raw base fee from block
  priorityFee: number; // Raw priority fee
  totalGasGwei?: number; // baseFee + priorityFee in Gwei (calculated for convenience)
  open?: number; // Open price for candlestick (totalGasGwei)
  high?: number;
  low?: number;
  close?: number;
}

export interface ChainState {
  baseFee: number; // Current base fee in Gwei
  priorityFee: number; // Current priority fee in Gwei
  history: GasPoint[]; // Historical data for candlestick chart
  loading: boolean; // Loading state for initial fetch
  error: string | null; // Error state for RPC issues
}

export interface AppState {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainState;
    polygon: ChainState;
    arbitrum: ChainState;
  };
  usdPrice: number; // ETH/USD price
  transactionValueEth: number; // User input for ETH transfer in simulation mode
  gasLimit: number; // Fixed gas limit for simple ETH transfer

  // Actions
  setMode: (mode: 'live' | 'simulation') => void;
  updateChainGas: (chain: keyof AppState['chains'], baseFee: number, priorityFee: number) => void;
  updateUsdPrice: (price: number) => void;
  setTransactionValueEth: (value: number) => void;
  addGasPointToHistory: (chain: keyof AppState['chains'], newPoint: { timestamp: number; baseFee: number; priorityFee: number }) => void;
  setChainLoading: (chain: keyof AppState['chains'], loading: boolean) => void;
  setChainError: (chain: keyof AppState['chains'], error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'live',
  chains: {
    ethereum: { baseFee: 0, priorityFee: 0, history: [], loading: true, error: null },
    polygon: { baseFee: 0, priorityFee: 0, history: [], loading: true, error: null },
    arbitrum: { baseFee: 0, priorityFee: 0, history: [], loading: true, error: null },
  },
  usdPrice: 0,
  transactionValueEth: 0.5, // Default to 0.5 ETH for simulation
  gasLimit: 21000, // Standard gas limit for a simple ETH transfer

  setMode: (mode) => set({ mode }),
  updateChainGas: (chain, baseFee, priorityFee) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], baseFee, priorityFee },
      },
    })),
  updateUsdPrice: (price) => set({ usdPrice: price }),
  setTransactionValueEth: (value) => set({ transactionValueEth: value }),
  setChainLoading: (chain, loading) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], loading },
      },
    })),
  setChainError: (chain, error) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], error },
      },
    })),

  // Logic for aggregating historical gas data into 15-minute candlesticks
  addGasPointToHistory: (chain, newPointData) => {
    set((state) => {
      const chainState = state.chains[chain];
      const history = [...chainState.history];
      const lastPoint = history[history.length - 1];

      // Convert Wei to Gwei for consistency
      const newTotalGasGwei = (newPointData.baseFee + newPointData.priorityFee); // Already in Gwei from RPC fetching logic
      const interval = 15 * 60 * 1000; // 15 minutes in milliseconds

      if (lastPoint && (newPointData.timestamp - lastPoint.timestamp) < interval && lastPoint.timestamp === Math.floor(newPointData.timestamp / interval) * interval) {
        // Still within the same 15-min interval and snapped to the same start time, update current OHLC
        lastPoint.high = Math.max(lastPoint.high || 0, newTotalGasGwei);
        lastPoint.low = Math.min(lastPoint.low || Infinity, newTotalGasGwei);
        lastPoint.close = newTotalGasGwei;
        lastPoint.baseFee = newPointData.baseFee; // Update the raw fees too
        lastPoint.priorityFee = newPointData.priorityFee;
      } else {
        // New 15-min interval, start a new candlestick
        const snappedTimestamp = Math.floor(newPointData.timestamp / interval) * interval;
        history.push({
          timestamp: snappedTimestamp,
          open: newTotalGasGwei,
          high: newTotalGasGwei,
          low: newTotalGasGwei,
          close: newTotalGasGwei,
          baseFee: newPointData.baseFee,
          priorityFee: newPointData.priorityFee
        });
        // Keep history to a reasonable length (e.g., last 24 hours = 96 points * 4 = 384 points for 15-min)
        if (history.length > (96 * 4)) history.shift(); // Roughly 4 days of 15-min data
      }

      return {
        chains: {
          ...state.chains,
          [chain]: { ...chainState, history },
        },
      };
    });
  },
}));