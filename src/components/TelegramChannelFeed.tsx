import React, { useState, useEffect } from 'react';
import { LiveSignal } from '../types/trading';
import { formatTelegramSignal } from '../utils/indicators';
import {
  Send,
  ExternalLink,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface TelegramChannelFeedProps {
  currentSignal: LiveSignal | null;
  autoDispatch: boolean;
  onToggleAutoDispatch: (enabled: boolean) => void;
  onOpenModal: () => void;
}

export const TelegramChannelFeed: React.FC<TelegramChannelFeedProps> = ({
  currentSignal,
  autoDispatch,
  onToggleAutoDispatch,
  onOpenModal,
}) => {
  const [botToken, setBotToken] = useState<string>(() => localStorage.getItem('tg_bot_token') || '');
  const [chatId, setChatId] = useState<string>(() => localStorage.getItem('tg_chat_id') || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; timestamp: number; message: string; status: string }>>([]);

  const channelUrl = 'https://t.me/+fvNHZMaLggM3YWRl';
  const formattedSignal = currentSignal ? formatTelegramSignal(currentSignal) : '';

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/telegram/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        if (data.chatId && !chatId) {
          setChatId(data.chatId);
          localStorage.setItem('tg_chat_id', data.chatId);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const isConnected = Boolean(botToken.trim() && chatId.trim());

  const handleCopyText = () => {
    if (formattedSignal) {
      navigator.clipboard.writeText(formattedSignal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOneClickTelegramShare = () => {
    if (formattedSignal) {
      navigator.clipboard.writeText(formattedSignal);
      const url = `https://t.me/share/url?url=${encodeURIComponent(channelUrl)}&text=${encodeURIComponent(formattedSignal)}`;
      window.open(url, '_blank');
    }
  };

  const handleAutoDetectAndSave = async () => {
    if (!botToken.trim()) {
      setStatusMsg({ success: false, text: 'Please enter your Telegram Bot Token from @BotFather first.' });
      return;
    }

    setIsDetecting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/telegram/detect-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim() }),
      });
      const data = await res.json();

      if (data.success && data.chatId) {
        setChatId(String(data.chatId));
        localStorage.setItem('tg_chat_id', String(data.chatId));
        localStorage.setItem('tg_bot_token', botToken.trim());
        setStatusMsg({
          success: true,
          text: `🎉 Connected as @${data.botUsername || 'bot'}! Test message sent to your Telegram group.`,
        });
        fetchHistory();
      } else {
        setStatusMsg({
          success: false,
          text: data.message || 'Make sure the bot is an Admin in https://t.me/+fvNHZMaLggM3YWRl with Post Messages permission, send "hi" in the group, and click again.',
        });
      }
    } catch (err: any) {
      setStatusMsg({ success: false, text: `Connection error: ${err.message}` });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSendLiveBroadcast = async () => {
    if (!formattedSignal) return;
    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/telegram/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formattedSignal,
          botToken: botToken.trim() || undefined,
          chatId: chatId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.apiSent) {
        setStatusMsg({
          success: true,
          text: '🚀 Signal posted automatically into your Telegram group via Bot API!',
        });
      } else {
        handleOneClickTelegramShare();
        setStatusMsg({
          success: true,
          text: 'Signal text copied & Telegram opened for instant 1-tap posting!',
        });
      }
      fetchHistory();
    } catch (err: any) {
      setStatusMsg({ success: false, text: `Broadcast failed: ${err.message}` });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/20 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                TELEGRAM LIVE CHANNEL &amp; BROADCAST HUB
              </h2>
              {isConnected ? (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  100% AUTOMATED BOT CONNECTED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  SETUP REQUIRED FOR AUTO-DELIVERY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Target Channel:</span>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sky-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>{channelUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Join Telegram Group</span>
          </a>

          <button
            onClick={handleSendLiveBroadcast}
            disabled={isSending || !formattedSignal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isSending ? 'Sending...' : 'Broadcast Current Signal'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Telegram Channel Feed Simulation (Left 7 cols) & Why Messages weren't received / Fix Guide (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): In-App Real-Time Telegram Channel Stream */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>In-App Live Telegram Channel Feed (Real-Time Simulation)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Mirrors https://t.me/+fvNHZMaLggM3YWRl
            </span>
          </div>

          {/* Telegram App Container Simulation */}
          <div className="bg-[#0f172a] rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex flex-col min-h-[520px]">
            {/* Telegram Channel Header Bar */}
            <div className="px-4 py-3 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  AP
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight">AlphaPulse AI Signals</span>
                    <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Channel • Live Millisecond Market Intelligence
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>STREAM ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Telegram Message Canvas */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#0f172a] to-[#090d16]">
              {/* Pinned Announcement */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">📌 Pinned Message</span>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    Welcome to the <strong>AlphaPulse AI Live Trading Intelligence Feed</strong>! All BUY/SELL signals are generated via multi-indicator confluence (RSI Divergence, MACD Impulse, Wyckoff Upthrust/Spring, ICT Market Structure Shifts) paired with deep Volume Spread Analysis (VSA &amp; CVD Delta).
                  </p>
                </div>
              </div>

              {/* Active Live Signal Post in Telegram Bubble */}
              {currentSignal ? (
                <div className="flex flex-col items-start max-w-full">
                  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl rounded-tl-sm p-4 shadow-lg text-white max-w-xl space-y-3">
                    {/* Channel Signature */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 text-xs">
                      <span className="font-bold text-sky-400">AlphaPulse AI Terminal</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(currentSignal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    {/* Pre-formatted Signal Text */}
                    <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed select-all">
                      {formattedSignal}
                    </pre>

                    {/* Telegram Bubble Footer */}
                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>👁️ 1.4k views</span>
                        <span>•</span>
                        <span>⚡ Real-time tick</span>
                      </div>
                      <button
                        onClick={handleCopyText}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Signal'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Listening for live market signal...
                </div>
              )}
            </div>

            {/* Bottom Interactive Share Bar */}
            <div className="p-3 bg-[#1e293b] border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Auto-Broadcast: <strong className={autoDispatch ? 'text-emerald-400' : 'text-slate-400'}>{autoDispatch ? 'ENABLED' : 'DISABLED'}</strong>
                </span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoDispatch}
                    onChange={(e) => onToggleAutoDispatch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleOneClickTelegramShare}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>1-Click Post in Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Why messages weren't received + 30-Second Fix Guide */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Explanation Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-sm text-slate-900">
                Why Did You Not Receive Messages In Telegram?
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Telegram has strict security policies: <strong>no external website or server can post into your private group (<code className="text-sky-700">https://t.me/+fvNHZMaLggM3YWRl</code>) without an authorized Telegram Bot.</strong>
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <span className="font-bold block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                The Solution:
              </span>
              <p className="leading-snug text-[11px]">
                Create a free bot in 30 seconds with <strong>@BotFather</strong>, add it as Admin to your group, and paste the token below. Once connected, signals post <strong>100% automatically in the background 24/7 without manual clicks!</strong>
              </p>
            </div>
          </div>

          {/* 30-Second Fast Bot Setup Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Connect Telegram Bot (30 Seconds)
                </h4>
              </div>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sky-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>Open @BotFather</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Steps checklist */}
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700">1</span>
                <span>Open <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-bold">@BotFather</a> on Telegram &gt; send <code>/newbot</code>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700">2</span>
                <span>Copy the HTTP API Token provided by BotFather.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700">3</span>
                <span>Add your bot to <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-bold">{channelUrl}</a> as an <strong>Admin with Post Messages permission</strong>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] shrink-0 text-slate-700">4</span>
                <span>Paste token below and click <strong>Auto-Detect Group ID &amp; Connect</strong>!</span>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[11px] text-slate-700 font-bold block mb-1">
                  Telegram Bot API Token
                </label>
                <input
                  type="password"
                  placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAutoDetectAndSave}
                  disabled={isDetecting || !botToken.trim()}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
                  <span>{isDetecting ? 'Connecting...' : 'Auto-Detect Group & Connect'}</span>
                </button>

                <button
                  onClick={onOpenModal}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                  title="Advanced Settings"
                >
                  Settings
                </button>
              </div>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  statusMsg.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusMsg.text}</span>
              </div>
            )}
          </div>

          {/* Can You Create A Public Channel? Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-sm text-slate-900">
                Can You Create A Public Channel Instead?
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Yes! If you want a channel with a public handle (like <code className="text-purple-700">@MyAlphaSignals</code>) instead of a private link:
            </p>

            <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600">
              <li>In Telegram, tap the pencil/compose button &gt; <strong>New Channel</strong>.</li>
              <li>Choose <strong>Public Channel</strong> and pick a link name (e.g. <code>t.me/MyTradingSignals</code>).</li>
              <li>Add your bot as an Admin.</li>
              <li>In the terminal, you can send to that channel anytime!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
