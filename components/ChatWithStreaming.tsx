'use client';

import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useState } from 'react';

interface ChatWithStreamingProps {
  reportIds?: string[];
}

export default function ChatWithStreaming({ reportIds }: ChatWithStreamingProps) {
  const [input, setInput] = useState('');
  const { response, loading, error, metrics, streamChat } = useStreamingChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await streamChat(input, reportIds);
    setInput('');
  };

  return (
    <div className="space-y-4 p-4 max-w-2xl">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-blue-600 font-medium">Streaming response...</span>
        </div>
      )}

      {/* Response Container */}
      <div className="relative">
        <div className="p-4 bg-gray-50 rounded-lg min-h-24 max-h-96 overflow-y-auto border border-gray-200">
          {response ? (
            <div className="text-gray-800 leading-relaxed">
              {/* Format response as readable text with paragraphs */}
              {response.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3 last:mb-0">
                  {paragraph.trim()}
                </p>
              ))}
              {loading && (
                <span className="inline-block animate-pulse ml-1 text-gray-400">●</span>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">
              {loading ? 'Waiting for response...' : 'Response will appear here'}
            </p>
          )}
        </div>
      </div>

      {/* Live Token Count During Streaming */}
      {(loading || metrics) && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 block text-xs mb-1">Tokens</span>
              <p className="font-mono font-bold text-emerald-600 text-lg">
                {metrics?.tokenCount || 0}
              </p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">Speed</span>
              <p className="font-mono font-bold text-emerald-600 text-lg">
                {metrics?.tokensPerSecond ? `${metrics.tokensPerSecond} tok/s` : '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">TTFT</span>
              <p className="font-mono font-bold text-emerald-600">
                {metrics?.ttft ? `${metrics.ttft}ms` : '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">Total</span>
              <p className="font-mono font-bold text-emerald-600">
                {metrics?.totalLatency ? `${metrics.totalLatency}ms` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about financial data... (e.g., 'What was Apple revenue in 2025?')"
          disabled={loading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span>
              Streaming...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>

      {/* Instructions */}
      <div className="text-xs text-gray-500 p-2 border-l-2 border-gray-300 pl-3">
        💡 <strong>Tip:</strong> Watch the metrics above to see streaming latency. Metrics track:
        <ul className="list-disc ml-4 mt-1">
          <li><strong>Total Latency</strong> - Full response time</li>
          <li><strong>TTFT</strong> - Time until first token appears (perception of speed)</li>
          <li><strong>Speed</strong> - Tokens generated per second</li>
        </ul>
      </div>
    </div>
  );
}
