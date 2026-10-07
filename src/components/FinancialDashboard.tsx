"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, DollarSign, Percent, Activity } from "lucide-react";

interface FinancialData {
  year: string;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  cashFlow: number;
  assetTurnover: number;
  roeCurrent: number;
}

interface FinancialDashboardProps {
  companyName: string;
  data: FinancialData[];
  currency?: string;
}

export function FinancialDashboard({ companyName, data, currency = "USD" }: FinancialDashboardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">No financial data available for {companyName}</p>
      </div>
    );
  }

  // Calculate metrics
  const latestYear = data[data.length - 1];
  const previousYear = data[data.length - 2] || latestYear;
  const revenueGrowth = ((latestYear.revenue - previousYear.revenue) / previousYear.revenue * 100).toFixed(1);
  const incomeGrowth = ((latestYear.netIncome - previousYear.netIncome) / previousYear.netIncome * 100).toFixed(1);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return `${(value / 1e3).toFixed(1)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{companyName} Financial Analysis</h2>
        <p className="mt-1 text-sm text-slate-600">{data[0].year} – {latestYear.year}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Latest Revenue"
          value={formatCurrency(latestYear.revenue)}
          change={revenueGrowth}
          icon={<DollarSign className="h-5 w-5" />}
          color="bg-blue-50 text-blue-700"
        />
        <KpiCard
          label="Net Income"
          value={formatCurrency(latestYear.netIncome)}
          change={incomeGrowth}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-green-50 text-green-700"
        />
        <KpiCard
          label="Operating Margin"
          value={`${((latestYear.operatingIncome / latestYear.revenue) * 100).toFixed(1)}%`}
          change={"-"}
          icon={<Percent className="h-5 w-5" />}
          color="bg-purple-50 text-purple-700"
        />
        <KpiCard
          label="ROE"
          value={`${latestYear.roeCurrent.toFixed(1)}%`}
          change={"-"}
          icon={<Activity className="h-5 w-5" />}
          color="bg-orange-50 text-orange-700"
        />
      </div>

      {/* Revenue & Net Income Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Revenue & Income Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="netIncome" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Net Income" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Trend */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Operating Cash Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Bar dataKey="cashFlow" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Cash Flow" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profitability Metrics */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Profitability Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
            <Legend />
            <Line type="monotone" dataKey="roeCurrent" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="ROE %" />
            <Line type="monotone" dataKey="assetTurnover" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} name="Asset Turnover" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Year</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Revenue</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Op. Income</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Net Income</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Cash Flow</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">ROE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900 font-medium">{row.year}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.operatingIncome)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.netIncome)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.cashFlow)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.roeCurrent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ label, value, change, icon, color }: KpiCardProps) {
  return (
    <div className={`rounded-lg ${color.split(" ")[0]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {change !== "-" && (
            <p className={`mt-1 text-xs font-semibold ${parseFloat(change) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {parseFloat(change) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(change))}%
            </p>
          )}
        </div>
        <div className={`rounded-lg ${color.split(" ")[1]} p-3`}>{icon}</div>
      </div>
    </div>
  );
}
