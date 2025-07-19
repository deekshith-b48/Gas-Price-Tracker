# ⛽ Real-Time Cross-Chain Gas Price Tracker with Wallet Simulation 📈

This project is a Next.js dashboard designed to fetch and display real-time gas prices from Ethereum, Polygon, and Arbitrum. It also includes a "simulation mode" to calculate estimated transaction costs in USD, leveraging live ETH/USD prices from Uniswap V3.

---

## ✨ Features

* **Real-Time Gas Prices:** Fetches `baseFeePerGas` and `maxPriorityFeePerGas` (or equivalent) directly from native RPC endpoints using WebSocket connections.
* **Cross-Chain Support:** Tracks gas prices for Ethereum, Polygon, and Arbitrum.
* **Live ETH/USD Price:** Parses `Swap` events from the Uniswap V3 ETH/USDC pool on Ethereum to calculate and display the current ETH/USD exchange rate.
* **Wallet Simulation:** In "simulation mode," users can input a transaction value (e.g., 0.5 ETH transfer), and the dashboard calculates and visualizes the total USD cost (gas + transaction value) across all supported chains. (Note: A standard 21,000 gas limit is used for simple ETH transfers).
* **Interactive Candlestick Charts:** Visualizes historical gas price volatility (combined base + priority fee in Gwei) over 15-minute intervals using `lightweight-charts`.
* **Responsive Dashboard:** Built with Next.js and Tailwind CSS for a modern and adaptable user interface.
* **State Management:** Utilizes Zustand for efficient and reactive state management, handling "live" and "simulation" modes with shared data.

---

## 🚀 Technologies Used

* **Next.js 14+**: React framework for production.
* **TypeScript**: For type safety and better developer experience.
* **Tailwind CSS**: Utility-first CSS framework for rapid and responsive UI development.
* **Ethers.js (v5)**: For interacting with Ethereum, Polygon, and Arbitrum RPCs (WebSocket providers, fetching block data, parsing Uniswap events).
* **Zustand**: A small, fast, and scalable bear-bones state-management solution.
* **Lightweight Charts**: High-performance financial charting library for displaying candlestick data.

---

## 🔧 Main Methods & Architecture

### State Management (`app/store/useAppStore.ts`)
- Centralized Zustand store manages all chain states, transaction simulation, and UI modes.
- Methods include:
  - `updateChainGas(chain, baseFee, priorityFee)`
  - `updateArbitrumL1Cost(l1CostUSD)`
  - `updateUsdPrice(price)`
  - `setTransactionValueEth(value)`
  - `addGasPointToHistory(chain, newPointData)`
  - `setChainLoading(chain, loading)`
  - Handles candlestick aggregation for charting.

### Web3 Integration (`app/lib/web3Utils.ts`)
- Uses native WebSocket RPC endpoints for real-time updates.
- Fetches latest block data including gas prices.
- Parses Uniswap V3 pool swap logs to calculate live ETH/USD.
- Special logic for Arbitrum L1 data fee estimation.

### Candlestick Data Aggregation
- Every gas price update is snapped to a 15-minute interval.
- Updates OHLC (open, high, low, close) data for chart visualization.
- Historical data is maintained in memory with option to persist.

---

## 🖼️ Screenshots

> To enhance this section, add screenshots showing:
> - Real-time dashboard view (live gas prices and charts)
> - Simulation mode UI (transaction value input, cost breakdown)
> - Candlestick chart with gas price volatility
> - Responsive mobile and desktop views

Example:

![Dashboard Screenshot](https://github.com/deekshith-b48/Gas-Price-Tracker/blob/main/ScreenShots/Screenshot_20250718_200710.png)
![Simulation Mode](https://github.com/deekshith-b48/Gas-Price-Tracker/blob/main/ScreenShots/Screenshot_20250718_200815.png)
![Candlestick Chart](https://github.com/deekshith-b48/Gas-Price-Tracker/blob/main/ScreenShots/Screenshot_20250718_200855.png)

---

## 🛠️ Setup and Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/deekshith-b48/Gas-Price-Tracker.git
    cd Gas-Price-Tracker
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure Environment Variables:**
    Create a `.env.local` file in the root of the project and add your RPC API keys. You will need WebSocket (ws:// or wss://) endpoints for real-time gas updates and HTTP (http:// or https://) endpoints for fetching historical data like Uniswap logs.

    ```env
    NEXT_PUBLIC_ETHEREUM_RPC_WS=...
    NEXT_PUBLIC_POLYGON_RPC_WS=...
    NEXT_PUBLIC_ARBITRUM_RPC_WS=...
    NEXT_PUBLIC_ETHEREUM_RPC_HTTP=...
    NEXT_PUBLIC_POLYGON_RPC_HTTP=...
    NEXT_PUBLIC_ARBITRUM_RPC_HTTP=...
    ```

4. **Start the development server:**
    ```bash
    npm run dev
    ```

---

## 💡 Usage

* **Live Mode:** The dashboard will automatically fetch and display real-time gas prices for Ethereum, Polygon, and Arbitrum. The candlestick charts will update every 15 minutes with new price intervals.
* **Simulation Mode:** Click the "Simulation Mode" button. Enter a value (in ETH) for your simulated transaction. The dashboard will instantly calculate and show the estimated USD cost of the transaction (gas + value) across all chains, using the live ETH/USD price.

---

## 🛠️ Key Complexities Handled

* **Direct RPC Interaction:** Utilizes `ethers.providers.WebSocketProvider` for real-time, low-latency gas price updates without relying on third-party gas APIs.
* **Uniswap V3 Price Parsing:** Directly interprets `Swap` events from the Uniswap V3 pool using `ethers.getLogs` and raw `sqrtPriceX96` values to derive ETH/USD, avoiding higher-level SDKs.
* **Zustand State Machine:** Robust state management for seamless switching between "live" and "simulation" modes.
* **Candlestick Data Aggregation:** Converts continuous updates into 15-minute OHLC candlestick data points.
* **Gas Fee Calculations:** Accurately computes transaction costs, including EIP-1559 details.

---

## ⚠️ Known Limitations / Future Improvements

* **Arbitrum L1 Cost Estimation:** Current calculation reflects L2 fees; improving precision for L1 data fee would require advanced RPC or SDK.
* **Advanced Priority Fee Estimation:** Priority fee estimation is simplified; dynamic estimation could improve accuracy.
* **Error Reporting:** Add more granular error messages for RPC failures.
* **Historical Data Persistence:** Implement local storage or backend for chart data persistence.
* **Transaction Type Customization:** Extend simulation to cover more transaction types (ERC-20 transfer, NFT mint, etc.).

---

## 📬 Contact

For questions or feedback, please open an issue on [GitHub](https://github.com/deekshith-b48/Gas-Price-Tracker/issues).
