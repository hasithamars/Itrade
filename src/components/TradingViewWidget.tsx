import React, { useEffect, useRef } from 'react';
import { getTradingViewSymbol } from '../utils/indicators';

interface TradingViewWidgetProps {
  symbol: string; // e.g. "BTC/USD" or "SET:TRUE"
  timeframe: string; // "15", "60", "D"
  theme?: 'light' | 'dark';
  onSymbolChange?: (newSymbol: string) => void;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'BTC/USD',
  timeframe = '15',
  theme = 'light',
  onSymbolChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = useRef(`tradingview_${Math.random().toString(36).substring(2, 9)}`);

  // Listen to postMessage events from TradingView embed iframe if symbol is changed inside widget
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        let data = event.data;
        if (typeof data === 'string' && (data.includes('symbol') || data.includes('{'))) {
          try {
            data = JSON.parse(data);
          } catch {}
        }
        if (typeof data === 'object') {
          // Check common TradingView message shapes
          const possibleSymbol =
            data.symbol ||
            data.name === 'symbol-change' && data.data?.symbol ||
            data.name === 'tv-widget-symbol-change' && (data.data?.symbol || data.data) ||
            data.event === 'symbolChange' && data.symbol;

          if (possibleSymbol && typeof possibleSymbol === 'string' && onSymbolChange) {
            onSymbolChange(possibleSymbol);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [onSymbolChange]);

  useEffect(() => {
    let tvScript: HTMLScriptElement | null = null;
    let widget: any = null;

    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined' && containerRef.current) {
        // Map timeframe to TradingView intervals
        const intervalMap: Record<string, string> = {
          '1m': '1',
          '5m': '5',
          '15m': '15',
          '1h': '60',
          '4h': '240',
          '1D': 'D',
        };
        const interval = intervalMap[timeframe] || '15';
        const tvTicker = getTradingViewSymbol(symbol);

        // Clear previous content
        containerRef.current.innerHTML = '';
        const widgetContainer = document.createElement('div');
        widgetContainer.id = containerId.current;
        widgetContainer.style.width = '100%';
        widgetContainer.style.height = '100%';
        containerRef.current.appendChild(widgetContainer);

        widget = new window.TradingView.widget({
          autosize: true,
          symbol: tvTicker,
          interval: interval,
          timezone: 'Asia/Bangkok',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'light' ? '#f8fafc' : '#0c1017',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          container_id: containerId.current,
          studies: [
            'Volume@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BollingerBands@tv-basicstudies',
          ],
        });
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      tvScript = document.createElement('script');
      tvScript.src = 'https://s3.tradingview.com/tv.js';
      tvScript.type = 'text/javascript';
      tvScript.async = true;
      tvScript.onload = initWidget;
      document.head.appendChild(tvScript);
    }

    return () => {
      if (widget && typeof widget.remove === 'function') {
        try {
          widget.remove();
        } catch {}
      }
    };
  }, [symbol, timeframe, theme]);

  return (
    <div className="w-full h-full min-h-[460px] relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
