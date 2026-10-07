"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { FileText, Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface DocumentStats {
  totalDocuments: number;
  indexed: number;
  pending: number;
  failed: number;
  totalSize: number;
}

interface CompanyDocuments {
  company: string;
  count: number;
  indexed: number;
  size: number;
}

interface IndexingProgress {
  date: string;
  completed: number;
  pending: number;
  failed: number;
}

interface DocumentDashboardProps {
  stats: DocumentStats;
  byCompany: CompanyDocuments[];
  progress: IndexingProgress[];
}

export function DocumentDashboard({
  stats = {
    totalDocuments: 156,
    indexed: 142,
    pending: 8,
    failed: 6,
    totalSize: 2450,
  },
  byCompany = [
    { company: "Microsoft", count: 12, indexed: 11, size: 245 },
    { company: "Apple", count: 15, indexed: 15, size: 378 },
    { company: "Google", count: 18, indexed: 17, size: 412 },
    { company: "Amazon", count: 14, indexed: 13, size: 289 },
    { company: "Meta", count: 11, indexed: 10, size: 198 },
  ],
  progress = [
    { date: "Day 1", completed: 20, pending: 80, failed: 0 },
    { date: "Day 2", completed: 45, pending: 55, failed: 0 },
    { date: "Day 3", completed: 78, pending: 22, failed: 0 },
    { date: "Day 4", completed: 120, pending: 10, failed: 2 },
    { date: "Day 5", completed: 142, pending: 8, failed: 6 },
  ],
}: DocumentDashboardProps) {
  const statusData = [
    { name: "Indexed", value: stats.indexed, color: "#10b981" },
    { name: "Pending", value: stats.pending, color: "#f59e0b" },
    { name: "Failed", value: stats.failed, color: "#ef4444" },
  ];

  const formatSize = (mb: number) => `${(mb / 1024).toFixed(2)} GB`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Document Management</h2>
        <p className="mt-1 text-sm text-slate-600">Upload status and indexing progress</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Documents"
          value={stats.totalDocuments.toString()}
          icon={<FileText className="h-5 w-5" />}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Indexed"
          value={stats.indexed.toString()}
          subtext={`${((stats.indexed / stats.totalDocuments) * 100).toFixed(1)}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Pending"
          value={stats.pending.toString()}
          icon={<Clock className="h-5 w-5" />}
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          label="Failed"
          value={stats.failed.toString()}
          icon={<AlertCircle className="h-5 w-5" />}
          color="bg-red-50 text-red-700"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Indexing Status Pie Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Indexing Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Documents by Company */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Documents by Company</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCompany} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="company" stroke="#94a3b8" style={{ fontSize: "12px" }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="indexed" fill="#10b981" radius={[4, 4, 0, 0]} name="Indexed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indexing Progress Over Time */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Indexing Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
            <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Company Details Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Company</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Total</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Indexed</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Progress</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {byCompany.map((company) => (
              <tr key={company.company} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{company.company}</td>
                <td className="px-4 py-3 text-right text-slate-700">{company.count}</td>
                <td className="px-4 py-3 text-right text-slate-700">{company.indexed}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(company.indexed / company.count) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {((company.indexed / company.count) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{(company.size / 1024).toFixed(2)} GB</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-3 text-slate-900">Total</td>
              <td className="px-4 py-3 text-right text-slate-900">{byCompany.reduce((sum, c) => sum + c.count, 0)}</td>
              <td className="px-4 py-3 text-right text-slate-900">{byCompany.reduce((sum, c) => sum + c.indexed, 0)}</td>
              <td className="px-4 py-3 text-right text-slate-900">
                {(
                  (byCompany.reduce((sum, c) => sum + c.indexed, 0) /
                    byCompany.reduce((sum, c) => sum + c.count, 0)) *
                  100
                ).toFixed(0)}
                %
              </td>
              <td className="px-4 py-3 text-right text-slate-900">{(stats.totalSize / 1024).toFixed(2)} GB</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, subtext, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg ${color.split(" ")[0]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="mt-1 text-xs font-semibold text-slate-600">{subtext}</p>}
        </div>
        <div className={`rounded-lg ${color.split(" ")[1]} p-3`}>{icon}</div>
      </div>
    </div>
  );
}
