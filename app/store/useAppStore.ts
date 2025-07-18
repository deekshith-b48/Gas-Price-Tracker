// Zustand State Store with Arbitrum L1 Cost Support
import { create } from 'zustand';

// GasPoint interface remains unchanged
export interface GasPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  totalGasGwei?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

// Add L1CostUSD to ChainState
export interface ChainState {
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
  loading: boolean;
  error: string | null;
  l1CostUSD?: number;
}

export interface AppState {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainState;
    polygon: ChainState;
    arbitrum: ChainState;
  };
  usdPrice: number;
  transactionValueEth: number;
  gasLimit: number;
  // Actions
  setMode: (mode: 'live' | 'simulation') => void;
  updateChainGas: (chain: keyof AppState['chains'], baseFee: number, priorityFee: number) => void;
  updateArbitrumL1Cost: (l1CostUSD: number) => void; // New action for Arbitrum L1 pricing
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
    arbitrum: { baseFee: 0, priorityFee: 0, history: [], loading: true, error: null, l1CostUSD: 0 }
  },
  usdPrice: 0,
  transactionValueEth: 0.5,
  gasLimit: 21000,
  // Implement all required actions
  setMode: (mode) => set({ mode }),
  updateChainGas: (chain, baseFee, priorityFee) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], baseFee, priorityFee }
      }
    })),
  updateArbitrumL1Cost: (l1CostUSD) =>
    set((state) => ({
      chains: {
        ...state.chains,
        arbitrum: { ...state.chains.arbitrum, l1CostUSD }
      }
    })),
  updateUsdPrice: (price) => set({ usdPrice: price }),
  setTransactionValueEth: (value) => set({ transactionValueEth: value }),
  addGasPointToHistory: (chain, newPointData) => {
    // Implementation remains unchanged
    set((state) => {
      const chainState = state.chains[chain];
      const history = [...chainState.history];
      const lastPoint = history[history.length - 1];
      const newTotalGasGwei = newPointData.baseFee + newPointData.priorityFee;
      const interval = 15 * 60 * 1000;
      const snappedTimestamp = Math.floor(newPointData.timestamp / interval) * interval;
      
      if (lastPoint && lastPoint.timestamp === snappedTimestamp) {
        lastPoint.high = Math.max(lastPoint.high || 0, newTotalGasGwei);
        lastPoint.low = Math.min(lastPoint.low || Infinity, newTotalGasGwei);
        lastPoint.close = newTotalGasGwei;
      } else {
        history.push({
          timestamp: snappedTimestamp,
          open: newTotalGasGwei,
          high: newTotalGasGwei,
          low: newTotalGasGwei,
          close: newTotalGasGwei,
          baseFee: newPointData.baseFee,
          priorityFee: newPointData.priorityFee
        });
        if (history.length > 384) history.shift();
      }
      
      return {
        chains: {
          ...state.chains,
          [chain]: { ...chainState, history }
        }
      };
    });
  },
  setChainLoading: (chain, loading) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], loading }
      }
    })),
  setChainError: (chain, error) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: { ...state.chains[chain], error }
      }
    }))
}));