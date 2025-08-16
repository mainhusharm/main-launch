import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Settings, Activity, TrendingUp, TrendingDown } from 'lucide-react';

const AutomatedSignals: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    interval: 60,
    minConfidence: 75,
    maxSignalsPerHour: 5
  });

  const startBot = () => {
    setIsRunning(true);
    // Simulate signal generation
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newSignal = {
          id: Date.now(),
          pair: ['EURUSD', 'GBPUSD', 'USDJPY'][Math.floor(Math.random() * 3)],
          direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
          confidence: Math.floor(Math.random() * 25) + 75,
          timestamp: new Date()
        };
        setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
      }
    }, settings.interval * 1000);

    return () => clearInterval(interval);
  };

  const stopBot = () => {
    setIsRunning(false);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-white">Automated Signal Bot</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-gray-300">{isRunning ? 'Running' : 'Stopped'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Bot Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Check Interval: {settings.interval}s
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={settings.interval}
                onChange={(e) => setSettings(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Confidence: {settings.minConfidence}%
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={settings.minConfidence}
                onChange={(e) => setSettings(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={startBot}
                disabled={isRunning}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Bot</span>
              </button>
              
              <button
                onClick={stopBot}
                disabled={!isRunning}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Bot</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Recent Signals ({signals.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {signals.map(signal => (
              <div key={signal.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {signal.direction === 'BUY' ? 
                      <TrendingUp className="w-4 h-4 text-green-400" /> : 
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                    <span className="text-white font-medium">{signal.pair}</span>
                    <span className={`text-sm ${signal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.direction}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-semibold">{signal.confidence}%</div>
                    <div className="text-xs text-gray-400">{signal.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedSignals;