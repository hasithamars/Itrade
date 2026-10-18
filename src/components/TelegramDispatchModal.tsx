import React, { useState, useEffect } from 'react';
import { LiveSignal } from '../types/trading';
import { formatTelegramSignal } from '../utils/indicators';
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  Bot,
  ShieldCheck,
  X,
  CheckCircle,
  HelpCircle,
  Clock,
  Radio,
  Save,
  Zap,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface TelegramDispatchModalProps {
  signal: LiveSignal | null;
  isOpen: boolean;
  onClose: () => void;
  autoDispatch: boolean;
  onToggleAutoDispatch: (enabled: boolean) => void;
  lastDispatchedTime?: number | null;
}

export const TelegramDispatchModal: React.FC<TelegramDispatchModalProps> = ({
  signal,
  isOpen,
  onClose,
  autoDispatch,
  onToggleAutoDispatch,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [botToken, setBotToken] = useState<string>(() => localStorage.getItem('tg_bot_token') || '');
  const [chatId, setChatId] = useState<string>(() => localStorage.getItem('tg_chat_id') || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'AUTO_SETUP' | 'LOGS'>('BROADCAST');
  const [history, setHistory] = useState<Array<{ id: string; timestamp: number; message: string; status: string; error?: string }>>([]);
  const [channelTitle, setChannelTitle] = useState<string>('');

  const channelUrl = 'https://t.me/+fvNHZMaLggM3YWRl';
  const formattedText = signal ? formatTelegramSignal(signal) : '';

  // Load history & config from backend
  const fetchHistoryAndConfig = async () => {
    try {
      const res = await fetch('/api/telegram/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        if (data.chatId && !chatId) {
          setChatId(data.chatId);
          localStorage.setItem('tg_chat_id', data.chatId);
        }
        if (data.channelTitle) {
          setChannelTitle(data.channelTitle);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistoryAndConfig();
    }
  }, [isOpen]);

  const handleSaveConfig = async () => {
    localStorage.setItem('tg_bot_token', botToken.trim());
    localStorage.setItem('tg_chat_id', chatId.trim());
    try {
      await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim(), chatId: chatId.trim() }),
      });
      setSendStatus({
        success: true,
        msg: '✅ Credentials saved! Automated signals will broadcast directly into your Telegram channel in real time.',
      });
    } catch (e: any) {
      setSendStatus({ success: true, msg: 'Credentials saved locally.' });
    }
  };

  const handleAutoDetectChat = async () => {
    if (!botToken.trim()) {
      setSendStatus({ success: false, msg: 'Please paste your Telegram Bot Token first.' });
      return;
    }
    setIsDetecting(true);
    setSendStatus(null);

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
        setSendStatus({
          success: true,
          msg: `🎉 ${data.message || `Detected and connected to ${data.chatTitle || 'group'}!`}`,
        });
        fetchHistoryAndConfig();
      } else {
        setSendStatus({
          success: false,
          msg: data.message || data.error || 'Could not auto-detect group. Please ensure bot was added to https://t.me/+fvNHZMaLggM3YWRl as Admin.',
        });
      }
    } catch (err: any) {
      setSendStatus({ success: false, msg: `Detection failed: ${err.message}` });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSendTestSignal = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setSendStatus({
        success: false,
        msg: 'Please provide both Bot Token and Chat ID to send a live test message.',
      });
      return;
    }

    setIsTesting(true);
    setSendStatus(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim(),
        }),
      });
      const data = await res.json();

      if (data.success && data.apiSent) {
        setSendStatus({
          success: true,
          msg: '🚀 Test signal sent! Check your Telegram channel https://t.me/+fvNHZMaLggM3YWRl now!',
        });
        fetchHistoryAndConfig();
      } else {
        setSendStatus({
          success: false,
          msg: `Failed to deliver test message: ${data.error || 'Unknown error'}`,
        });
      }
    } catch (err: any) {
      setSendStatus({ success: false, msg: `Test failed: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenTelegram = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(channelUrl)}&text=${encodeURIComponent(formattedText)}`;
    window.open(shareUrl, '_blank');
  };

  const handleSendViaApi = async () => {
    if (!signal) return;
    setIsSending(true);
    setSendStatus(null);

    try {
      const res = await fetch('/api/telegram/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formattedText,
          botToken: botToken.trim() || undefined,
          chatId: chatId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.apiSent) {
        setSendStatus({
          success: true,
          msg: '🚀 Signal broadcasted to Telegram Channel via Bot API!',
        });
      } else {
        handleOpenTelegram();
        setSendStatus({
          success: true,
          msg: 'Signal formatted & channel opened for instant posting!',
        });
      }
      fetchHistoryAndConfig();
    } catch (err: any) {
      setSendStatus({ success: false, msg: `Send failed: ${err.message}` });
    } finally {
      setIsSending(false);
    }
  };

  const isConfigured = Boolean(botToken.trim() && chatId.trim());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Telegram Automated Signal Hub
                </h3>
                {isConfigured && autoDispatch ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    24/7 AUTO-BROADCAST ACTIVE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    BOT SETUP READY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Channel: <strong className="text-sky-700">https://t.me/+fvNHZMaLggM3YWRl</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'BROADCAST'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Signal Preview
          </button>
          <button
            onClick={() => setActiveTab('AUTO_SETUP')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'AUTO_SETUP'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Automatic Bot Setup</span>
            {!isConfigured && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'LOGS'
                ? 'border-sky-600 text-sky-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Broadcast Log ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {activeTab === 'BROADCAST' && (
            <>
              {/* Target Channel Banner */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-sky-950 block">Target Telegram Channel</span>
                    <span className="text-[11px] text-sky-700 font-mono truncate block max-w-[280px]">
                      {channelUrl}
                    </span>
                  </div>
                </div>

                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Open Channel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Status Indicator */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  {isConfigured ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="text-xs font-semibold">
                    {isConfigured
                      ? 'Telegram Bot Connected: Signals broadcast 100% automatically in background.'
                      : 'Connect your Telegram Bot once to post automatically without manual clicks.'}
                  </span>
                </div>
                {!isConfigured && (
                  <button
                    onClick={() => setActiveTab('AUTO_SETUP')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Setup Bot
                  </button>
                )}
              </div>

              {/* Formatted Signal Message Preview with Volume Analysis */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Live Signal Payload (With Volume Analysis)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Formatted Text'}</span>
                  </button>
                </div>

                <pre className="p-3.5 bg-slate-900 text-emerald-300 font-mono rounded-xl text-xs leading-relaxed whitespace-pre-wrap select-all max-h-56 overflow-y-auto border border-slate-800 shadow-inner">
                  {formattedText || 'Waiting for live signal...'}
                </pre>
              </div>

              {/* Automatic toggle status bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Automatic 24/7 Broadcasting
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sends every new signal to your Telegram channel automatically in real time.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoDispatch}
                    onChange={(e) => onToggleAutoDispatch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </>
          )}

          {activeTab === 'AUTO_SETUP' && (
            <div className="space-y-3">
              {/* Step-by-Step Instructions */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  How to Enable 100% Automatic Background Telegram Sending (1 Minute Setup)
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
                  <li>
                    Open Telegram and message <strong>@BotFather</strong>. Send <code>/newbot</code> and name your bot.
                  </li>
                  <li>
                    BotFather will reply with your HTTP API Token (e.g. <code>123456789:ABCdefGhI...</code>).
                  </li>
                  <li>
                    Open your channel <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold underline">https://t.me/+fvNHZMaLggM3YWRl</a>, go to <strong>Channel Settings &gt; Administrators &gt; Add Administrator</strong>, search your bot username, and grant permission to <em>Post Messages</em>.
                  </li>
                  <li>
                    Paste your Bot Token below and click <strong>Auto-Detect Group ID &amp; Connect</strong>!
                  </li>
                </ol>
              </div>

              {/* Bot Token & Chat ID Inputs */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                <div>
                  <label className="text-[11px] text-slate-700 font-bold block mb-1">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleAutoDetectChat}
                      disabled={isDetecting || !botToken.trim()}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 shrink-0"
                      title="Automatically find group/channel ID from Telegram"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
                      <span>{isDetecting ? 'Detecting...' : 'Auto-Detect Group ID'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-700 font-bold block mb-1">
                    Target Channel / Chat ID (Auto-filled or manual)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @your_channel or -100xxxxxxxxxx"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-800 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleSaveConfig}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save &amp; Activate 24/7 Auto-Broadcast</span>
                  </button>

                  <button
                    onClick={handleSendTestSignal}
                    disabled={isTesting || !botToken.trim() || !chatId.trim()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isTesting ? 'Sending...' : 'Send Test Signal'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Recent Broadcast Activity
              </span>
              {history.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No signals broadcasted yet. When a new signal triggers, it will appear here.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                          item.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans line-clamp-2">
                      {item.message.split('\n')[0]} - {item.message.split('\n')[2]}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {sendStatus && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                sendStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sendStatus.msg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleSendViaApi}
            disabled={isSending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-500/20 active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Broadcasting...' : 'Broadcast to Telegram Channel Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
