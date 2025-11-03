"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  LineSeries,
  CandlestickSeries,
} from "lightweight-charts";

interface TradingViewChartProps {
  data: Array<{
    createdAt: Date;
    id: number;
    location: string | null;
    notes: string | null;
    price: string;
  }>;
  unit: string;
}

type ChartType = "line" | "candlestick";
type ScaleType = "linear" | "logarithmic";

export function TradingViewChart({ data }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line" | "Candlestick"> | null>(null);
  const isInitializedRef = useRef(false);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [scaleType, setScaleType] = useState<ScaleType>("linear");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      crosshair: {
        mode: 1,
      },
      grid: {
        horzLines: { color: "#1f2937" },
        vertLines: { color: "#1f2937" },
      },
      height: 400,
      layout: {
        background: { color: "transparent", type: ColorType.Solid },
        textColor: "#9ca3af",
      },
      rightPriceScale: {
        borderColor: "#1f2937",
        mode: 0, // Normal (linear) by default
      },
      timeScale: {
        borderColor: "#1f2937",
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
        visible: true,
      },
      width: chartContainerRef.current.clientWidth,
    });

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data || data.length === 0) return;

    // Only try to remove series if we've already initialized once
    if (isInitializedRef.current && seriesRef.current) {
      try {
        chart.removeSeries(seriesRef.current);
      } catch {
        // Silently ignore - series may have already been removed
      }
      seriesRef.current = null;
    }

    if (chartType === "line") {
      // Create line series
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        crosshairMarkerRadius: 6,
        crosshairMarkerVisible: true,
        lastValueVisible: true,
        lineWidth: 2,
        priceLineVisible: true,
      });

      // Prepare line data
      const lineData = data
        .map((entry) => ({
          time: Math.floor(new Date(entry.createdAt).getTime() / 1000),
          value: parseFloat(entry.price),
        }))
        .sort((a, b) => a.time - b.time) as LineData[];

      if (lineData.length > 0) {
        lineSeries.setData(lineData);
        seriesRef.current = lineSeries;
        isInitializedRef.current = true;
      }
    } else {
      // Create candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        borderDownColor: "#ef4444",
        borderUpColor: "#10b981",
        downColor: "#ef4444",
        upColor: "#10b981",
        wickDownColor: "#ef4444",
        wickUpColor: "#10b981",
      });

      // Aggregate data into weekly candles
      const candleData = aggregateToCandles(data) as CandlestickData[];
      if (candleData.length > 0) {
        candleSeries.setData(candleData);
        seriesRef.current = candleSeries;
        isInitializedRef.current = true;
      }
    }

    // Fit content
    chart.timeScale().fitContent();
  }, [data, chartType]);

  // Update scale mode when scaleType changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      rightPriceScale: {
        mode: scaleType === "logarithmic" ? 1 : 0, // 0 = Normal, 1 = Logarithmic
      },
    });
  }, [scaleType]);

  return (
    <div className="space-y-4">
      {/* Toggle buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              chartType === "line"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setChartType("line")}
          >
            Line
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              chartType === "candlestick"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setChartType("candlestick")}
          >
            Candles
          </button>
        </div>

        {/* Divider */}
        <div className="bg-border h-8 w-px" />

        {/* Scale Type Toggle */}
        <div className="flex gap-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              scaleType === "linear"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setScaleType("linear")}
          >
            Linear
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              scaleType === "logarithmic"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setScaleType("logarithmic")}
          >
            Logarithmic
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative" ref={chartContainerRef} />
    </div>
  );
}

// Aggregate data by week to create OHLC candles
function aggregateToCandles(
  data: Array<{
    createdAt: Date;
    price: string;
  }>,
) {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sortedData.length === 0) return [];

  const weekMap = new Map<
    string,
    Array<{ date: Date; price: number; time: number }>
  >();

  // Group by week
  sortedData.forEach((entry) => {
    const date = new Date(entry.createdAt);
    const weekKey = getWeekKey(date);

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push({
      date,
      price: parseFloat(entry.price),
      time: Math.floor(date.getTime() / 1000),
    });
  });

  // Create candles from weekly data
  const candles: Array<{
    close: number;
    high: number;
    low: number;
    open: number;
    time: number;
  }> = [];
  weekMap.forEach((entries) => {
    const sortedEntries = entries.sort((a, b) => a.time - b.time);
    const prices = sortedEntries.map((e) => e.price);

    // Use the Monday of the week as the timestamp
    const firstDate = sortedEntries[0]!.date;
    const monday = getMonday(firstDate);

    candles.push({
      close: sortedEntries[sortedEntries.length - 1]!.price,
      high: Math.max(...prices),
      low: Math.min(...prices),
      open: sortedEntries[0]!.price,
      time: Math.floor(monday.getTime() / 1000),
    });
  });

  return candles.sort((a, b) => a.time - b.time);
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const weekNum = getWeekNumber(date);
  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
