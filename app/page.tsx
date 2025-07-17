
'use client';

import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { initGasPriceListeners, fetchUniswapEthUsdPrice, cleanupProviders } from './lib/web3Utils';
import { Header } from './components/Header';
import { GasPriceCard } from './components/GasPriceCard';
import { GasPriceChart } from './components/GasPriceChart';

export default function Home() {
  const { mode, chains, usdPrice, transactionValueEth, setTransactionValueEth, gasLimit } = useAppStore();

  // Initialize Web3 listeners and fetch price on component mount
  useEffect(() => {
    initGasPriceListeners();
    fetchUniswapEthUsdPrice(); // Initial fetch

    // Fetch USD price periodically
    const usdPriceInterval = setInterval(fetchUniswapEthUsdPrice, 30000); // Every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(usdPriceInterval);
      cleanupProviders();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 p-6 md:p-8 lg:p-12">
        {/* Current ETH/USD Price */}
        <div className="bg-blue-800 p-4 rounded-lg shadow-md mb-8 text-center">
          <p className="text-xl font-semibold">
            Live ETH/USD Price: <span className="text-green-300">${usdPrice.toFixed(4)}</span>
          </p>
          {usdPrice === 0 && (
            <p className="text-sm text-blue-200 mt-1">Fetching ETH/USD price... Ensure Ethereum RPC is working.</p>
          )}
        </div>

        {/* Simulation Mode Input */}
        {mode === 'simulation' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Simulate Transaction</h2>
            <div className="flex items-center space-x-4">
              <label htmlFor="txValue" className="text-gray-300">
                Transfer Value (ETH):
              </label>
              <input
                type="number"
                id="txValue"
                value={transactionValueEth}
                onChange={(e) => setTransactionValueEth(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                className="w-32 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Gas Price Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <GasPriceCard
            chainName="ethereum"
            chainData={chains.ethereum}
            usdPrice={usdPrice}
            transactionValueEth={transactionValueEth}
            gasLimit={gasLimit}
            mode={mode}
          />
          <GasPriceCard
            chainName="polygon"
            chainData={chains.polygon}
            usdPrice={usdPrice}
            transactionValueEth={transactionValueEth}
            gasLimit={gasLimit}
            mode={mode}
          />
          <GasPriceCard
            chainName="arbitrum"
            chainData={chains.arbitrum}
            usdPrice={usdPrice}
            transactionValueEth={transactionValueEth}
            gasLimit={gasLimit}
            mode={mode}
          />
        </section>

        {/* Candlestick Charts */}
        <section className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
          <GasPriceChart chainName="ethereum" data={chains.ethereum.history} />
          <GasPriceChart chainName="polygon" data={chains.polygon.history} />
          <GasPriceChart chainName="arbitrum" data={chains.arbitrum.history} />
        </section>
      </main>
    </div>
  );
}