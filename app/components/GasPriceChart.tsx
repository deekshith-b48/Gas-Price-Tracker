// app/components/GasPriceChart.tsx
'use client';
import React, { useRef, useEffect, memo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { GasPoint } from '../store/useAppStore';

interface GasPriceChartProps {
  data: GasPoint[];
  chainName: string;
}

export const GasPriceChart = memo(({ data, chainName }: GasPriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#1a202c' }, // Dark background
        textColor: '#e2e8f0', // Light text
      },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a', // Green
      downColor: '#ef5350', // Red
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resizing
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      try {
        // Format data for lightweight-charts
        const formattedData: CandlestickData[] = data
          .filter(point => 
            point && 
            typeof point.timestamp === 'number' && 
            point.open !== undefined && 
            point.high !== undefined && 
            point.low !== undefined && 
            point.close !== undefined
          )
          .map(point => ({
            time: Math.floor(point.timestamp / 1000) as any, // Convert ms to seconds
            open: point.open!,
            high: point.high!,
            low: point.low!,
            close: point.close!,
          }));

        if (formattedData.length > 0) {
          candlestickSeriesRef.current.setData(formattedData);
        }
      } catch (error) {
        console.error(`Error updating chart for ${chainName}:`, error);
      }
    }
  }, [data, chainName]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4">
      <h2 className="text-xl font-semibold text-white mb-4 capitalize">{chainName} Gas Price (Gwei)</h2>
      <div ref={chartContainerRef} className="w-full"></div>
    </div>
  );
});

GasPriceChart.displayName = 'GasPriceChart';