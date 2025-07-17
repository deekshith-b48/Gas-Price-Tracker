// app/components/Header.tsx
'use client';
import { useAppStore } from '../store/useAppStore';

export const Header = () => {
  const { mode, setMode } = useAppStore();

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">Cross-Chain Gas Tracker</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => setMode('live')}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            mode === 'live' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Live Mode
        </button>
        <button
          onClick={() => setMode('simulation')}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            mode === 'simulation' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Simulation Mode
        </button>
      </div>
    </header>
  );
};