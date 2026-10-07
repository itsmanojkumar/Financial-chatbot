"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Globe } from "lucide-react";

interface IndexData {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  market: "US" | "India";
  openingValue: number;
}

interface MarketTrendData {
  time: string;
  nse: number;
  sec: number;
}

interface MarketDashboardProps {
  indices: IndexData[];
  trends: MarketTrendData[];
}

export function MarketDashboard({
  indices = [
    { name: "NIFTY 50", symbol: "NIFTY", value: 24150.5, change: 287.3, changePercent: 1.2, market: "India", openingValue: 23863.2 },
    { name: "S&P 500", symbol: "SPX", value: 5812.4, change: 145.2, changePercent: 2.6, market: "US", openingValue: 5667.2 },
    { name: "SENSEX", symbol: "BSESN", value: 79345.8, change: 456.7, changePercent: 0.58, market: "India", openingValue: 78889.1 },
    { name: "Nasdaq", symbol: "CCMP", value: 18456.3, change: 312.1, changePercent: 1.7, market: "US", openingValue: 18144.2 },
  ],
  trends = [
    { time: "09:30", nse: 24050, sec: 5700 },
    { time: "10:00", nse: 24085, sec: 5715 },
    { time: "10:30", nse: 24120, sec: 5730 },
    { time: "11:00", nse: 24095, sec: 5745 },
    { time: "11:30", nse: 24150, sec: 5812 },
  ],
}: MarketDashboardProps) {
  const usIndices = indices.filter((i) => i.market === "US");
  const indiaIndices = indices.filter((i) => i.market === "India");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Market Overview</h2>
        <p className="mt-1 text-sm text-slate-600">NSE (India) and SEC (USA) market indices</p>
      </div>

      {/* US Market Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Globe className="h-5 w-5 text-blue-600" />
          United States Markets
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {usIndices.map((index) => (
            <IndexCard key={index.symbol} index={index} />
          ))}
        </div>
      </div>

      {/* India Market Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Globe className="h-5 w-5 text-orange-600" />
          India Markets (NSE)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {indiaIndices.map((index) => (
            <IndexCard key={index.symbol} index={index} />
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Today's NSE Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorNse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Area type="monotone" dataKey="nse" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNse)" name="NIFTY 50" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Today's S&P 500 Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Area type="monotone" dataKey="sec" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSec)" name="S&P 500" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Market Comparison (Normalized)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
            <Legend />
            <Line type="monotone" dataKey="nse" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="NIFTY 50" />
            <Line type="monotone" dataKey="sec" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="S&P 500" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Summary Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Index</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Current</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Opening</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Change</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Change %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {indices.map((index) => (
              <tr key={index.symbol} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{index.name}</div>
                  <div className="text-xs text-slate-500">{index.symbol}</div>
                </td>
                <td className="px-4 py-3 text-right text-slate-900 font-medium">{index.value.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700">{index.openingValue.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-semibold ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {index.change >= 0 ? "+" : ""}{index.change.toFixed(1)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold flex items-center justify-end gap-1 ${index.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {index.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {index.changePercent >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IndexCard({ index }: { index: IndexData }) {
  const isPositive = index.change >= 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{index.name}</h4>
          <p className="text-xs text-slate-500 mt-1">{index.symbol}</p>
        </div>
        <DollarSign className={`h-5 w-5 ${isPositive ? "text-green-600" : "text-red-600"}`} />
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900">{index.value.toLocaleString()}</p>
      </div>

      <div className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {isPositive ? "+" : ""}{index.change.toFixed(1)} ({index.changePercent.toFixed(2)}%)
      </div>
    </div>
  );
}
