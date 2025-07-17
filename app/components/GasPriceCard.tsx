// app/components/GasPriceCard.tsx
'use client';
import { AppState } from '../store/useAppStore';

interface GasPriceCardProps {
  chainName: string;
  chainData: AppState['chains'][keyof AppState['chains']];
  usdPrice: number;
  transactionValueEth: number;
  gasLimit: number;
  mode: 'live' | 'simulation';
}

export const GasPriceCard = ({
  chainName,
  chainData,
  usdPrice,
  transactionValueEth,
  gasLimit,
  mode,
}: GasPriceCardProps) => {
  const { baseFee, priorityFee, loading, error } = chainData;

  const totalGasGwei = (baseFee || 0) + (priorityFee || 0);

  // Calculate simulated cost in USD
  let simulatedCostUSD = 0;
  if (mode === 'simulation' && usdPrice > 0) {
    // (baseFee + priorityFee) in Gwei * gasLimit = Total Gas in Gwei
    // Total Gas in Gwei * 10^9 = Total Gas in Wei
    // Total Gas in Wei / 10^18 = Total Gas in ETH
    // Total Gas in ETH * ETH_USD_Price = Total Cost in USD
    const totalGasInWei = ((baseFee || 0) + (priorityFee || 0)) * (gasLimit || 21000) * (10 ** 9); // Gwei to Wei
    const totalGasInEth = totalGasInWei / (10 ** 18);
    simulatedCostUSD = (totalGasInEth * usdPrice) + (transactionValueEth * usdPrice); // Gas cost + transaction value
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 min-w-[280px]">
      <h2 className="text-xl font-semibold text-white mb-4 capitalize">{chainName}</h2>
      {loading && <p className="text-blue-400">Loading gas data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <>
          <p className="text-gray-300">
            Base Fee: <span className="font-medium text-white">{baseFee.toFixed(2)} Gwei</span>
          </p>
          <p className="text-gray-300">
            Priority Fee: <span className="font-medium text-white">{priorityFee.toFixed(2)} Gwei</span>
          </p>
          <p className="text-gray-300 mt-2">
            Total Gas: <span className="font-bold text-lg text-green-400">{totalGasGwei.toFixed(2)} Gwei</span>
          </p>

          {mode === 'simulation' && usdPrice > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-300 text-sm">Transaction Value: {transactionValueEth} ETH</p>
              <p className="text-yellow-300 text-lg font-bold">
                Simulated Cost: ${simulatedCostUSD.toFixed(4)} USD
              </p>
            </div>
          )}
          {mode === 'simulation' && usdPrice === 0 && (
            <p className="text-red-400 mt-4">Waiting for ETH/USD price...</p>
          )}
        </>
      )}
    </div>
  );
};