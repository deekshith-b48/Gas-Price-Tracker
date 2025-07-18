// app/lib/web3Utils.ts
import { ethers } from 'ethers';
import { AppState, useAppStore } from '../store/useAppStore';

// RPC Endpoints from environment variables
const ETH_WS_RPC = process.env.NEXT_PUBLIC_ETHEREUM_RPC_WS!;
const POLY_WS_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_WS!;
const ARB_WS_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_WS!;

const ETH_HTTP_RPC = process.env.NEXT_PUBLIC_ETHEREUM_RPC_HTTP!;
const POLY_HTTP_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_HTTP!;
const ARB_HTTP_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_HTTP!;

// Uniswap V3 ETH/USDC Pool Address (0.3% fee tier)
const UNISWAP_V3_ETH_USDC_POOL = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

// Uniswap V3 Pool ABI snippet for Swap event
const UNISWAP_V3_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

// HTTP Providers (more reliable than WebSocket for this use case)
const ethHttpProvider = ETH_HTTP_RPC ? new ethers.providers.JsonRpcProvider(ETH_HTTP_RPC) : null;
const polyHttpProvider = POLY_HTTP_RPC ? new ethers.providers.JsonRpcProvider(POLY_HTTP_RPC) : null;
const arbHttpProvider = ARB_HTTP_RPC ? new ethers.providers.JsonRpcProvider(ARB_HTTP_RPC) : null;

// Update interval in milliseconds (6 seconds)
const UPDATE_INTERVAL = 6000;

/**
 * Initializes intervals for gas price fetching using HTTP providers.
 */
export function initGasPriceListeners() {
  const { updateChainGas, addGasPointToHistory, setChainLoading, setChainError } = useAppStore.getState();

  const chains: { name: keyof AppState['chains']; provider: ethers.providers.JsonRpcProvider | null }[] = [
    { name: 'ethereum', provider: ethHttpProvider },
    { name: 'polygon', provider: polyHttpProvider },
    { name: 'arbitrum', provider: arbHttpProvider },
  ];

  // Set up intervals for each chain to fetch gas data every 6 seconds
  chains.forEach(({ name, provider }) => {
    if (provider) {
      // Initial fetch
      fetchGasData(name, provider, updateChainGas, addGasPointToHistory, setChainLoading, setChainError);
      
      // Set up interval
      const intervalId = setInterval(() => {
        fetchGasData(name, provider, updateChainGas, addGasPointToHistory, setChainLoading, setChainError);
      }, UPDATE_INTERVAL);
      
      // Store interval ID for cleanup
      intervalIds.push(intervalId);
      
      console.log(`Set up gas price monitoring for ${name}...`);
    } else {
      setChainError(name, `RPC URL for ${name} not configured.`);
    }
  });
}

// Store interval IDs for cleanup
const intervalIds: NodeJS.Timeout[] = [];

/**
 * Fetches gas data for a specific chain
 */
async function fetchGasData(
  chainName: keyof AppState['chains'],
  provider: ethers.providers.JsonRpcProvider,
  updateChainGas: (chain: keyof AppState['chains'], baseFee: number, priorityFee: number) => void,
  addGasPointToHistory: (chain: keyof AppState['chains'], point: { timestamp: number; baseFee: number; priorityFee: number }) => void,
  setChainLoading: (chain: keyof AppState['chains'], loading: boolean) => void,
  setChainError: (chain: keyof AppState['chains'], error: string | null) => void
) {
  try {
    console.log(`[${chainName}] Starting gas data fetch...`);
    setChainLoading(chainName, true);
    
    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`[${chainName}] Latest block: ${blockNumber}`);
    const block = await provider.getBlock(blockNumber);
    console.log(`[${chainName}] Block data:`, block?.baseFeePerGas ? 'has baseFee' : 'no baseFee');
    
    let baseFeePerGas: ethers.BigNumber;
    let priorityFeePerGas: ethers.BigNumber;
    
    // Handle EIP-1559 chains (Ethereum, Polygon)
    if (block.baseFeePerGas) {
      console.log(`[${chainName}] Using EIP-1559 gas pricing`);
      baseFeePerGas = block.baseFeePerGas;
      
      // Get max priority fee from network
      try {
        const priorityFeeHex = await provider.send('eth_maxPriorityFeePerGas', []);
        console.log(`[${chainName}] Priority fee hex: ${priorityFeeHex}`);
        priorityFeePerGas = ethers.BigNumber.from(priorityFeeHex);
      } catch (e) {
        console.log(`[${chainName}] Priority fee method not supported, using fallback`);
        // Fallback if method not supported
        priorityFeePerGas = ethers.utils.parseUnits("1.5", "gwei");
      }
    } else {
      console.log(`[${chainName}] Using legacy gas pricing`);
      // For non-EIP-1559 chains (like Arbitrum)
      baseFeePerGas = await provider.getGasPrice();
      
      // Arbitrum specific handling
      if (chainName === 'arbitrum') {
        console.log(`[${chainName}] Applying Arbitrum L1 fee adjustment`);
        // For Arbitrum, we need to account for L1 data fee
        // This is a simplified approach - in production, you'd use the Arbitrum SDK
        // to calculate the precise L1 data fee component
        const l2GasPrice = baseFeePerGas;
        const estimatedL1Fee = l2GasPrice.mul(3).div(10); // Rough estimate: ~30% of L2 gas for L1 data fee
        baseFeePerGas = l2GasPrice.add(estimatedL1Fee);
        priorityFeePerGas = ethers.BigNumber.from(0); // No priority fee concept in Arbitrum
      } else {
        // For other non-EIP-1559 chains
        priorityFeePerGas = ethers.BigNumber.from(0);
      }
    }
    
    // Convert to Gwei for display
    const baseFeeGwei = parseFloat(ethers.utils.formatUnits(baseFeePerGas, 'gwei'));
    const priorityFeeGwei = parseFloat(ethers.utils.formatUnits(priorityFeePerGas, 'gwei'));
    
    console.log(`[${chainName}] Gas fees - Base: ${baseFeeGwei} Gwei, Priority: ${priorityFeeGwei} Gwei`);
    
    // Update state
    updateChainGas(chainName, baseFeeGwei, priorityFeeGwei);
    
    // Add to history for charts
    addGasPointToHistory(chainName, {
      timestamp: Date.now(),
      baseFee: baseFeeGwei,
      priorityFee: priorityFeeGwei,
    });
    
    console.log(`[${chainName}] Gas data updated successfully`);
    setChainError(chainName, null); // Clear any previous error
  } catch (error: any) {
    console.error(`[${chainName}] Error fetching gas:`, error);
    setChainError(chainName, error.message || 'Failed to fetch gas data');
  } finally {
    setChainLoading(chainName, false);
  }
}

/**
 * Fetches and updates ETH/USD price from Uniswap V3 Swap events.
 */
export async function fetchUniswapEthUsdPrice() {
  const { updateUsdPrice } = useAppStore.getState();

  if (!ethHttpProvider) {
    console.error("Ethereum HTTP RPC not configured for Uniswap price fetching.");
    updateUsdPrice(0);
    return;
  }

  try {
    console.log("Fetching ETH/USD price from Uniswap V3...");
    
    // Method 1: Use Swap events (more accurate for high-volume pools)
    const price = await getUniswapPriceFromSwapEvents();
    console.log("Price from swap events:", price);
    
    if (price > 0) {
      updateUsdPrice(price);
      return;
    }
    
    // Method 2: Fallback to slot0 if no recent swaps
    console.log("No recent swaps found, falling back to slot0...");
    const priceFromSlot0 = await getUniswapPriceFromSlot0();
    console.log("Price from slot0:", priceFromSlot0);
    updateUsdPrice(priceFromSlot0);
  } catch (error: any) {
    console.error("Error fetching ETH/USD price from Uniswap:", error);
    updateUsdPrice(0); // Reset price on error
  }
}

/**
 * Gets ETH/USD price from Uniswap V3 Swap events
 */
async function getUniswapPriceFromSwapEvents(): Promise<number> {
  if (!ethHttpProvider) return 0;
  
  const iface = new ethers.utils.Interface(UNISWAP_V3_POOL_ABI);
  const swapEventTopic = iface.getEventTopic('Swap');
  
  // Fetch recent logs for the Swap event
  const logs = await ethHttpProvider.getLogs({
    address: UNISWAP_V3_ETH_USDC_POOL,
    topics: [swapEventTopic],
    fromBlock: await ethHttpProvider.getBlockNumber() - 50, // Look back 50 blocks
    toBlock: 'latest',
  });
  
  if (logs.length === 0) {
    console.warn("No Uniswap V3 Swap events found in recent blocks.");
    return 0;
  }
  
  // Find the latest valid Swap event
  const latestLog = logs[logs.length - 1];
  const decodedLog = iface.parseLog(latestLog);
  const sqrtPriceX96 = decodedLog.args.sqrtPriceX96;
  
  return calculateEthUsdPrice(sqrtPriceX96);
}

/**
 * Gets ETH/USD price from Uniswap V3 slot0 function
 */
async function getUniswapPriceFromSlot0(): Promise<number> {
  if (!ethHttpProvider) return 0;
  
  const uniswapPool = new ethers.Contract(
    UNISWAP_V3_ETH_USDC_POOL,
    UNISWAP_V3_POOL_ABI,
    ethHttpProvider
  );
  
  const slot0 = await uniswapPool.slot0();
  const sqrtPriceX96 = slot0.sqrtPriceX96;
  
  return calculateEthUsdPrice(sqrtPriceX96);
}

/**
 * Calculates ETH/USD price from sqrtPriceX96
 */
function calculateEthUsdPrice(sqrtPriceX96: ethers.BigNumber): number {
  // For ETH/USDC pool on Uniswap V3, token0 is USDC and token1 is WETH
  // price = (sqrtPriceX96 / 2^96)^2
  // This gives us the price in terms of token0/token1, which is USDC/WETH
  // Since we want ETH/USD, we need to invert this
  
  try {
    // Convert BigNumber to regular number for calculation
    const sqrtPriceX96Number = parseFloat(sqrtPriceX96.toString());
    
    // Calculate the raw price ratio
    const sqrtPrice = sqrtPriceX96Number / Math.pow(2, 96);
    const price = sqrtPrice * sqrtPrice;
    
    // Adjust for token decimals: USDC has 6 decimals, WETH has 18 decimals
    // So we need to multiply by 10^(18-6) = 10^12
    const adjustedPrice = price * Math.pow(10, 12);
    
    // Since this gives us USDC per WETH, we need to invert to get WETH per USDC (ETH/USD)
    const ethUsdPrice = 1 / adjustedPrice;
    
    console.log(`Raw price: ${price}, Adjusted: ${adjustedPrice}, ETH/USD: ${ethUsdPrice}`);
    
    // Sanity check: ETH price should be between $100 and $100,000
    if (ethUsdPrice > 100 && ethUsdPrice < 100000) {
      return ethUsdPrice;
    } else {
      console.warn(`ETH price ${ethUsdPrice} seems out of range, falling back to slot0`);
      return 0;
    }
  } catch (error) {
    console.error("Error calculating ETH/USD price:", error);
    return 0;
  }
}

/**
 * Cleanup function for intervals.
 */
export function cleanupProviders() {
  // Clear all intervals
  intervalIds.forEach(id => clearInterval(id));
  intervalIds.length = 0; // Clear the array
  
  console.log("Gas price monitoring intervals destroyed.");
}