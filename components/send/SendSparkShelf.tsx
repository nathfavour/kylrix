'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Clock, 
  Copy, 
  ExternalLink, 
  Import, 
  MoreVertical, 
  Trash2, 
  FileText, 
  KeyRound, 
  ListTodo, 
  Shield, 
  Upload, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';
import type { SendSparkRef, SendKind } from '@/lib/send/types';
import toast from 'react-hot-toast';
import { burnEphemeralNoteWithProof } from '@/lib/ephemeral/burn-note';

const PRIMARY = '#6366F1';

const KIND_COLORS: Record<SendKind, string> = {
  note: '#EC4899',       // Pink (Note App)
  password: '#10B981',   // Green (Vault App)
  totp: '#10B981',       // Green (Vault App)
  task: '#A855F7',       // Purple (Flow App)
  file: '#6366F1',       // Indigo (Accounts/Send)
  discussion: '#F59E0B'  // Amber/Orange (Connect App)
};

function SendSparkClock({ createdAt, expiresAt, color = PRIMARY }: { createdAt: string; expiresAt: string; color?: string }) {
  const [pct, setPct] = React.useState(100);

  React.useEffect(() => {
    const tick = () => {
      const created = new Date(createdAt).getTime();
      const expires = new Date(expiresAt).getTime();
      const now = Date.now();
      const total = expires - created;
      const remaining = Math.max(0, expires - now);
      setPct(total > 0 ? (remaining / total) * 100 : 0);
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [createdAt, expiresAt]);

  const size = 18;
  const stroke = 2;
  const c = size / 2;
  const r = c - stroke;
  const circum = 2 * Math.PI * r;
  const offset = circum - (pct / 100) * circum;

  return (
    <div className="inline-flex ml-2">
      <svg width={size} height={size}>
        <circle stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent" r={r} cx={c} cy={c} />
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circum} ${circum}`}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
          strokeLinecap="round"
          fill="transparent"
          r={r}
          cx={c}
          cy={c}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </svg>
    </div>
  );
}

interface Props {
  sparks: SendSparkRef[];
  onSaveSparks: (next: SendSparkRef[]) => void;
  onClaim?: (spark: SendSparkRef) => void;
}

export function SendSparkShelf({ sparks, onSaveSparks, onClaim }: Props) {
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [nowTs, setNowTs] = useState(0);

  useEffect(() => {
    const tick = () => setNowTs(Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const active = useMemo(() => {
    if (!nowTs) return sparks;
    return sparks.filter((s) => new Date(s.expiresAt).getTime() > nowTs);
  }, [sparks, nowTs]);

  const stale = useMemo(() => {
    if (!nowTs) return [];
    return sparks.filter((s) => new Date(s.expiresAt).getTime() <= nowTs);
  }, [sparks, nowTs]);

  const ctxNote = useMemo(() => {
    if (!menu) return undefined;
    return sparks.find((s) => s.id === menu.id);
  }, [menu, sparks]);

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, id });
  };

  const closeMenu = () => setMenu(null);

  const handleRemoveOrBurn = async () => {
    const id = menu?.id;
    if (!id) return;
    const spark = sparks.find((s) => s.id === id);
    closeMenu();

    if (spark?.deletionSecret) {
      try {
        await burnEphemeralNoteWithProof(id, spark.deletionSecret);
      } catch {
        toast.error('Could not delete this link on the server.');
        return;
      }
      toast.success('Link deleted — it no longer works.');
    }

    onSaveSparks(sparks.filter((s) => s.id !== id));
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      /* ignore */
    }
  };

  if (sparks.length === 0) return null;

  const renderCard = (spark: SendSparkRef, staleRow: boolean) => {
    const sparkColor = KIND_COLORS[spark.kind] || PRIMARY;
    const Icon = (() => {
      switch (spark.kind) {
        case 'note': return FileText;
        case 'password': return KeyRound;
        case 'task': return ListTodo;
        case 'totp': return Shield;
        case 'file': return Upload;
        case 'discussion': return MessageSquare;
        default: return Sparkles;
      }
    })();

    return (
      <div
        key={spark.id}
        onContextMenu={(e) => openMenu(e, spark.id)}
        style={{
          borderColor: '#34322F',
        }}
        className={`p-5 rounded-[24px] border bg-[#161412] hover:bg-[#1C1A18] transition-all duration-300 shadow-2xl ${
          staleRow ? 'opacity-50' : 'opacity-100 hover:-translate-y-0.5'
        }`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 min-w-0 flex-1">
            <div style={{ color: sparkColor }} className="mt-0.5 flex-shrink-0">
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-sm text-white truncate">
                {spark.title}
              </h4>
              <span className="block text-white/40 text-[10px] font-bold uppercase tracking-wider font-mono mt-1">
                {spark.kind.toUpperCase()} · {new Date(spark.createdAt).toLocaleDateString()}
              </span>
              {staleRow && (
                <span className="block text-white/30 text-[10px] font-semibold font-sans mt-2">
                  Expired — delete still works if the item is still on the server.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <SendSparkClock createdAt={spark.createdAt} expiresAt={spark.expiresAt} color={sparkColor} />
            <button 
              onClick={(e) => openMenu(e, spark.id)} 
              className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={() => void copyUrl(spark.url)}
            style={{ color: sparkColor }}
            className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 transition-all"
            aria-label="Copy link"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => window.open(spark.url, '_blank')}
            style={{ color: sparkColor }}
            className="p-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 transition-all"
            aria-label="Open"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 select-none">
        <Clock size={16} className="text-[#6366F1]" />
        <h3 className="font-black text-[#F5F3F0] text-base font-mono">
          Stash
        </h3>
      </div>

      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          {active.map((s) => renderCard(s, false))}
        </div>
      )}

      {stale.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <span className="text-[10px] font-black tracking-widest uppercase text-white/30 font-mono block">
            EXPIRED
          </span>
          {stale.map((s) => renderCard(s, true))}
        </div>
      )}

      {/* Floating Context Menu */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div 
            style={{ top: menu.y, left: menu.x }}
            className="fixed z-50 min-w-[200px] bg-[#161412] border border-white/5 rounded-xl py-1 shadow-2xl animate-in fade-in duration-100 select-none"
          >
            {onClaim && ctxNote && (
              <button
                onClick={() => {
                  closeMenu();
                  onClaim(ctxNote);
                }}
                className="w-full px-4 py-2.5 text-xs font-bold text-[#6366F1] hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors"
              >
                <Import size={16} />
                <span>Claim to account</span>
              </button>
            )}
            <button
              onClick={() => void handleRemoveOrBurn()}
              className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors"
            >
              <Trash2 size={16} />
              <span>{ctxNote?.deletionSecret ? 'Delete link' : 'Remove from this device'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
