"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, MessageSquare, TrendingUp, Zap } from "lucide-react";

interface UserAnalyticsData {
  date: string;
  questionsAsked: number;
  activeUsers: number;
  conversationsStarted: number;
  avgQuestionsPerUser: number;
}

interface PlanData {
  name: string;
  value: number;
  color: string;
}

interface UserAnalyticsDashboardProps {
  data: UserAnalyticsData[];
  planDistribution?: PlanData[];
  totalUsers?: number;
  totalQuestions?: number;
  proUsers?: number;
}

export function UserAnalyticsDashboard({
  data,
  planDistribution = [
    { name: "Free", value: 65, color: "#6b7280" },
    { name: "Pro", value: 35, color: "#10b981" },
  ],
  totalUsers = 1250,
  totalQuestions = 8940,
  proUsers = 437,
}: UserAnalyticsDashboardProps) {
  const latestData = data[data.length - 1] || {};
  const avgQuestionsPro = proUsers > 0 ? (totalQuestions * 0.6 / proUsers).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Analytics</h2>
        <p className="mt-1 text-sm text-slate-600">Usage patterns and engagement metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Questions This Month"
          value={totalQuestions.toLocaleString()}
          icon={<MessageSquare className="h-5 w-5" />}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Pro Users"
          value={proUsers.toLocaleString()}
          icon={<Zap className="h-5 w-5" />}
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          label="Avg. Pro Questions"
          value={avgQuestionsPro}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Active Users */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Questions & Conversations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Questions Asked</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Bar dataKey="questionsAsked" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Questions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Conversations Started</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="conversationsStarted" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Conversations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Date</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Active Users</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Questions</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Conversations</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Avg Q/User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.slice(-7).map((row) => (
              <tr key={row.date} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900 font-medium">{row.date}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.activeUsers}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.questionsAsked}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.conversationsStarted}</td>
                <td className="px-4 py-3 text-right text-slate-700">{row.avgQuestionsPerUser.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg ${color.split(" ")[0]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg ${color.split(" ")[1]} p-3`}>{icon}</div>
      </div>
    </div>
  );
}
