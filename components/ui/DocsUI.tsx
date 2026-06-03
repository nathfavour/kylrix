'use client';

import React from 'react';
import { useDocs, DocLanguage } from '@/context/DocsContext';
import { Terminal, Code, Cpu, Package } from 'lucide-react';

const LANGUAGE_CONFIG: Record<DocLanguage, { label: string; icon: any; color: string }> = {
  typescript: { label: 'TypeScript', icon: Code, color: '#3178C6' },
  go: { label: 'Go', icon: Cpu, color: '#00ADD8' },
  python: { label: 'Python', icon: Package, color: '#3776AB' },
  dart: { label: 'Dart', icon: Terminal, color: '#0175C2' }
};

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useDocs();

  return (
    <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl w-fit">
      {(Object.entries(LANGUAGE_CONFIG) as [DocLanguage, typeof LANGUAGE_CONFIG.typescript][]).map(([key, config]) => (
        <button
          key={key}
          onClick={() => setLanguage(key)}
          title={config.label}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            language === key
              ? 'text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
          style={{
            backgroundColor: language === key ? config.color : 'transparent'
          }}
        >
          {key === 'typescript' ? 'TS' : config.label}
        </button>
      ))}
    </div>
  );
};

interface CodeBlockProps {
  languages: Partial<Record<DocLanguage, string>>;
}

export const CodeBlock = ({ languages }: CodeBlockProps) => {
  const { language } = useDocs();
  
  const currentCode = languages[language] || languages['typescript'] || 'Code not available for this language.';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black/40 backdrop-blur-2xl">
      <div className="px-6 py-3 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
        <span className="font-mono text-xs text-[#6366F1] font-bold opacity-80">
          {LANGUAGE_CONFIG[language].label}
        </span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
          <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
          <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
        </div>
      </div>
      <pre className="m-0 p-6 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-400">
        <code>{currentCode}</code>
      </pre>
    </div>
  );
};
