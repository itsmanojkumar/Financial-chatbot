// hooks/useStreamingChat.ts
import { useState, useCallback } from 'react';

interface StreamMetrics {
  startTime: number;
  firstTokenTime?: number;
  endTime?: number;
  totalLatency?: number;
  ttft?: number; // Time to first token
  tokensPerSecond?: number;
  tokenCount?: number;
}

export function useStreamingChat() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);

  const streamChat = useCallback(async (message: string, reportIds?: string[]) => {
    setLoading(true);
    setResponse('');
    setError('');
    setMetrics(null);

    const startTime = performance.now();
    let tokenCount = 0;
    let firstTokenTime: number | undefined;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          reportIds: reportIds || []
        })
      });

      if (!res.ok) throw new Error(`Stream failed: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        // Record first token time
        if (firstTokenTime === undefined) {
          firstTokenTime = performance.now();
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              if (json.token) {
                setResponse(prev => prev + json.token);
                tokenCount++;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      const endTime = performance.now();
      const totalLatency = endTime - startTime;
      const ttft = firstTokenTime ? firstTokenTime - startTime : totalLatency;
      const tokensPerSecond = (tokenCount / totalLatency) * 1000;

      const newMetrics: StreamMetrics = {
        startTime,
        firstTokenTime,
        endTime,
        totalLatency: Math.round(totalLatency),
        ttft: Math.round(ttft),
        tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
        tokenCount
      };

      setMetrics(newMetrics);

      // Log metrics to console
      console.log('📊 Chat Metrics:', {
        totalLatency: `${newMetrics.totalLatency}ms`,
        ttft: `${newMetrics.ttft}ms (Time to First Token)`,
        tokensPerSecond: `${newMetrics.tokensPerSecond} tokens/sec`,
        tokenCount: tokenCount,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error streaming response');
      console.error('Stream error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    response,
    loading,
    error,
    metrics,
    streamChat
  };
}
