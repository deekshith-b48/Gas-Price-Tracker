'use client'; // Required for Next.js 13+ App Router

import React, { useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useAppStore } from '../store/useAppStore';

interface GasChartProps {
  chainName: 'ethereum' | 'polygon' | 'arbitrum';
}

const GasChart: React.FC<GasChartProps> = ({ chainName }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const history = useAppStore((state) => state.chains[chainName].history);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart only once
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: { textColor: '#d1d4dc', background: { color: '#1a1e26' } },
        grid: { vertLines: { color: '#2b2b43' }, horzLines: { color: '#2b2b43' } },
        timeScale: { timeVisible: true, secondsVisible: false },
      });
      seriesRef.current = chart.addCandlestickSeries();
      chartRef.current = chart;
    }

    // Format data for the chart library
    const formattedData = history
      .filter(point => 
        point && 
        typeof point.timestamp === 'number' && 
        point.open !== undefined && 
        point.high !== undefined && 
        point.low !== undefined && 
        point.close !== undefined
      )
      .map(point => ({
        time: Math.floor(point.timestamp / 1000) as any,
        open: point.open!,
        high: point.high!,
        low: point.low!,
        close: point.close!,
      }));
    
    if (formattedData.length > 0) {
      seriesRef.current.setData(formattedData);
    }
    chartRef.current.timeScale().fitContent();

  }, [history]); // Re-run only when history data for this chain changes

  return <div ref={chartContainerRef} style={{ border: '1px solid #2b2b43', borderRadius: '4px' }} />;
};

export default GasChart;