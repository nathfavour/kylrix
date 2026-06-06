'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocalContext } from '@/lib/context-engine';
import { 
  X, 
  Lightbulb, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

const BRAND_INDIGO = '#6366F1';
const BRAND_EMERALD = '#10B981';
const BRAND_AMBER = '#F59E0B';

export function SuggestionsDeck() {
  const router = useRouter();
  const { suggestions, dismissSuggestion } = useLocalContext();

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed bottom-[100px] md:bottom-10 right-4 md:right-10 z-[1400] flex flex-col gap-4 max-w-[360px] w-[calc(100vw-32px)] pointer-events-none">
      <AnimatePresence>
        {suggestions.map((suggestion) => {
          const accentColor = suggestion.niche === 'connect' 
            ? BRAND_EMERALD 
            : suggestion.niche === 'intelligence' 
            ? BRAND_INDIGO 
            : BRAND_AMBER;

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="pointer-events-auto"
            >
              <div className="relative group overflow-hidden bg-[#161412] border border-white/6 rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-white/12">
                
                {/* 🏗️ Standardized Opaque Surface Side Indicator */}
                <div 
                  className="absolute top-0 left-0 bottom-0 w-1.5 z-10" 
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}40` }}
                />

                <div className="flex flex-col p-5 pl-7 gap-4">
                  
                  {/* 1. Header with Fixed Icon Slot + Stacked Text Column */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                      style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                    >
                      {suggestion.niche === 'intelligence' ? (
                        <Bot size={20} strokeWidth={2.5} />
                      ) : (
                        <Sparkles size={20} strokeWidth={2.5} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col gap-1 pr-4">
                      <span className="text-white font-black text-sm uppercase tracking-tight font-clash leading-tight">
                        {suggestion.title}
                      </span>
                      <p className="text-[#9B9691] font-bold text-[12px] leading-relaxed font-satoshi">
                        {suggestion.description}
                      </p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>

                  {/* 2. Standardized Action Row */}
                  {suggestion.actionLabel && suggestion.actionHref && (
                    <button
                      onClick={() => {
                        dismissSuggestion(suggestion.id);
                        router.push(suggestion.actionHref!);
                      }}
                      className="w-full flex items-center justify-between p-3.5 pl-4 rounded-xl bg-white/3 border border-white/5 group/btn hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                    >
                      <span className="text-white font-black text-[11px] uppercase tracking-widest">
                        {suggestion.actionLabel}
                      </span>
                      <ArrowRight size={14} className="text-white/20 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" strokeWidth={3} />
                    </button>
                  )}
                </div>

                {/* Subtle Ambient Pulse for Unread/Active Suggestions */}
                <div 
                  className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full blur-[40px] opacity-10 pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
