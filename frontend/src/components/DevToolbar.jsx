import React, { useState } from 'react';
import { useTelegram } from '../context/TelegramContext.jsx';
import { Shield, User, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';

export default function DevToolbar({ activeTab, setActiveTab }) {
  const { isInsideTelegram, isAdmin, updateDevUser, user } = useTelegram();
  const [collapsed, setCollapsed] = useState(true);

  if (isInsideTelegram) return null; // Only show when outside Telegram

  return (
    <div className="bg-zinc-950/95 border-b border-amber-500/30 text-zinc-300 text-xs px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Browser Preview:</span>
          <span className="text-zinc-400 hidden sm:inline">Simulating Telegram Mini App environment</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin / Customer Toggle */}
          <button
            onClick={() => updateDevUser({ isAdmin: !isAdmin })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {isAdmin ? <Shield size={12} /> : <User size={12} />}
            <span>{isAdmin ? 'Admin Mode (Active)' : 'Customer Mode'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              Open Admin Dashboard
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-white p-1"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
          <div>
            Current Mock User: <strong className="text-white">{user?.first_name} {user?.last_name}</strong> (ID: {user?.id})
          </div>
          <div>
            To test inside Telegram, open your bot via <strong className="text-gold-400">@grant_outfitbot</strong> with your BotFather token.
          </div>
        </div>
      )}
    </div>
  );
}
