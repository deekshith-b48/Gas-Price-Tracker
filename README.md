# ⛽ Real-Time Cross-Chain Gas Price Tracker with Wallet Simulation 📈

This project is a Next.js dashboard designed to fetch and display real-time gas prices from Ethereum, Polygon, and Arbitrum. It also includes a "simulation mode" to calculate estimated transaction costs in USD, leveraging live ETH/USD prices from Uniswap V3.

## ✨ Features

* **Real-Time Gas Prices:** Fetches `baseFeePerGas` and `maxPriorityFeePerGas` (or equivalent) directly from native RPC endpoints using WebSocket connections.
* **Cross-Chain Support:** Tracks gas prices for Ethereum, Polygon, and Arbitrum.
* **Live ETH/USD Price:** Parses `Swap` events from the Uniswap V3 ETH/USDC pool on Ethereum to calculate and display the current ETH/USD exchange rate.
* **Wallet Simulation:** In "simulation mode," users can input a transaction value (e.g., 0.5 ETH transfer), and the dashboard calculates and visualizes the total USD cost (gas + transaction value) across all supported chains. (Note: A standard 21,000 gas limit is used for simple ETH transfers).
* **Interactive Candlestick Charts:** Visualizes historical gas price volatility (combined base + priority fee in Gwei) over 15-minute intervals using `lightweight-charts`.
* **Responsive Dashboard:** Built with Next.js and Tailwind CSS for a modern and adaptable user interface.
* **State Management:** Utilizes Zustand for efficient and reactive state management, handling "live" and "simulation" modes with shared data.

## 🚀 Technologies Used

* **Next.js 14+**: React framework for production.
* **TypeScript**: For type safety and better developer experience.
* **Tailwind CSS**: Utility-first CSS framework for rapid and responsive UI development.
* **Ethers.js (v5)**: For interacting with Ethereum, Polygon, and Arbitrum RPCs (WebSocket providers, fetching block data, parsing Uniswap events).
* **Zustand**: A small, fast, and scalable bear-bones state-management solution.
* **Lightweight Charts**: High-performance financial charting library for displaying candlestick data.

## 🛠️ Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/gas-tracker-dashboard.git](https://github.com/your-username/gas-tracker-dashboard.git)
    cd gas-tracker-dashboard
    ```
    *(Note: Replace `https://github.com/your-username/gas-tracker-dashboard.git` with your actual repository URL)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root of the project and add your RPC API keys. You will need WebSocket (ws:// or wss://) endpoints for real-time gas updates and HTTP (http:// or https://) endpoints for fetching historical data like Uniswap logs.

    ```env
    # Get your API keys from Infura, Alchemy, etc.
    NEXT_PUBLIC_ETHEREUM_RPC_WS="wss://mainnet.infura.io/ws/v3/YOUR_INFURA_PROJECT_ID"
    NEXT_PUBLIC_POLYGON_RPC_WS="wss://[polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY](https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY)"
    NEXT_PUBLIC_ARBITRUM_RPC_WS="wss://[arbitrum-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY](https://arbitrum-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY)"

    NEXT_PUBLIC_ETHEREUM_RPC_HTTP="[https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID](https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID)"
    NEXT_PUBLIC_POLYGON_RPC_HTTP="[https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY](https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY)"
    NEXT_PUBLIC_ARBITRUM_RPC_HTTP="[https://arbitrum-mainnet.g.alchemy.com/v3/YOUR_ALCHEMY_API_KEY](https://arbitrum-mainnet.g.alchemy.com/v3/YOUR_ALCHEMY_API_KEY)"
    ```
    **Important:** Do not commit your `.env.local` file to version control!

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in your browser:**
    Visit `http://localhost:3000` to see the dashboard.

## 💡 Usage

* **Live Mode:** The dashboard will automatically fetch and display real-time gas prices for Ethereum, Polygon, and Arbitrum. The candlestick charts will update every 15 minutes with new price intervals.
* **Simulation Mode:** Click the "Simulation Mode" button. Enter a value (in ETH) for your simulated transaction. The dashboard will instantly calculate and show the estimated USD cost of the transaction (gas + value) across all chains, using the live ETH/USD price.

## 🚧 Key Complexities Handled

* **Direct RPC Interaction:** Utilizes `ethers.providers.WebSocketProvider` for real-time, low-latency gas price updates without relying on third-party gas APIs.
* **Uniswap V3 Price Parsing:** Directly interprets `Swap` events from the Uniswap V3 pool using `ethers.getLogs` and raw `sqrtPriceX96` values to derive ETH/USD, avoiding higher-level SDKs.
* **Zustand State Machine:** Implemented a robust state management system to seamlessly switch between "live" and "simulation" modes while maintaining and sharing real-time gas data and historical charts.
* **Candlestick Data Aggregation:** Logic for converting continuous real-time gas price updates into 15-minute OHLC (Open, High, Low, Close) candlestick data points.
* **Gas Fee Calculations:** Accurately calculates transaction costs, incorporating `baseFeePerGas` and `maxPriorityFeePerGas` where applicable (EIP-1559).

## ⚠️ Known Limitations / Future Improvements

* **Arbitrum L1 Cost Estimation:** The current Arbitrum gas calculation primarily reflects L2 fees. A more precise estimation for Arbitrum's L1 data fee would require more complex RPC interactions or a dedicated SDK.
* **Advanced Priority Fee Estimation:** For EIP-1559 chains, priority fee estimation is currently a simplified default. Implementing a more dynamic estimation (e.g., based on recent block priority fees) could improve accuracy.
* **Error Reporting:** More granular error messages for RPC connection failures or data parsing issues could be added.
* **Historical Data Persistence:** Currently, historical data for charts is lost on refresh. Implementing local storage or a backend could persist this data.
* **Transaction Type Customization:** Extend simulation mode to allow users to specify different transaction types (e.g., ERC-20 transfer, NFT mint) with varying gas limits.

---