'use client';

import { useState, useEffect } from 'react';

interface LatencyRecord {
  timestamp: string;
  totalLatency: number;
  ttft: number;
  tokensPerSecond: number;
  tokenCount: number;
  question: string;
}

export default function LatencyDashboard() {
  const [records, setRecords] = useState<LatencyRecord[]>([]);
  const [avgLatency, setAvgLatency] = useState(0);
  const [avgTTFT, setAvgTTFT] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('latencyRecords');
    if (saved) {
      const data = JSON.parse(saved);
      setRecords(data);
      calculateAverages(data);
    }
  }, []);

  const calculateAverages = (data: LatencyRecord[]) => {
    if (data.length === 0) return;
    const avgLat = Math.round(data.reduce((sum, r) => sum + r.totalLatency, 0) / data.length);
    const avgT = Math.round(data.reduce((sum, r) => sum + r.ttft, 0) / data.length);
    setAvgLatency(avgLat);
    setAvgTTFT(avgT);
  };

  const addRecord = (record: LatencyRecord) => {
    const updated = [record, ...records].slice(0, 50); // Keep last 50
    setRecords(updated);
    localStorage.setItem('latencyRecords', JSON.stringify(updated));
    calculateAverages(updated);
  };

  const clearRecords = () => {
    setRecords([]);
    localStorage.removeItem('latencyRecords');
    setAvgLatency(0);
    setAvgTTFT(0);
  };

  return (
    <div className="space-y-4 p-4 max-w-4xl">
      <h2 className="text-2xl font-bold">📊 Latency Tracking Dashboard</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-gray-600 text-sm font-medium">Avg Total Latency</p>
          <p className="text-3xl font-bold text-blue-600">{avgLatency}ms</p>
          <p className="text-xs text-gray-500 mt-1">{records.length} requests tracked</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <p className="text-gray-600 text-sm font-medium">Avg Time to First Token</p>
          <p className="text-3xl font-bold text-green-600">{avgTTFT}ms</p>
          <p className="text-xs text-gray-500 mt-1">Perceived speed</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <p className="text-gray-600 text-sm font-medium">Latest Speed</p>
          <p className="text-3xl font-bold text-purple-600">
            {records[0]?.tokensPerSecond || '-'} tok/s
          </p>
          <p className="text-xs text-gray-500 mt-1">Tokens per second</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Question (truncated)</th>
              <th className="p-3 text-right">Total (ms)</th>
              <th className="p-3 text-right">TTFT (ms)</th>
              <th className="p-3 text-right">Speed (tok/s)</th>
              <th className="p-3 text-right">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 text-gray-600 font-mono text-xs">{record.timestamp}</td>
                <td className="p-3 text-gray-700 truncate max-w-xs">
                  {record.question.substring(0, 30)}...
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-600">
                  {record.totalLatency}
                </td>
                <td className="p-3 text-right font-mono font-bold text-green-600">
                  {record.ttft}
                </td>
                <td className="p-3 text-right font-mono text-purple-600">
                  {record.tokensPerSecond}
                </td>
                <td className="p-3 text-right text-gray-600">{record.tokenCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No latency records yet. Use ChatWithStreaming to generate data.</p>
        </div>
      )}

      {records.length > 0 && (
        <button
          onClick={clearRecords}
          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm font-medium"
        >
          Clear History
        </button>
      )}

      {/* Tips */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="font-bold text-yellow-800">📈 Optimization Tips:</p>
        <ul className="list-disc ml-4 mt-2 text-sm text-yellow-700 space-y-1">
          <li><strong>TTFT < 500ms:</strong> Perceived as instant (good)</li>
          <li><strong>TTFT 500-1000ms:</strong> Still acceptable</li>
          <li><strong>TTFT > 1000ms:</strong> Consider optimizing backend</li>
          <li><strong>Speed > 20 tok/s:</strong> Fast Gemini 2.0 Flash model</li>
        </ul>
      </div>
    </div>
  );
}
