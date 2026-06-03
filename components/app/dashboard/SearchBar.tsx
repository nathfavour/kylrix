import { useEffect, useRef, useState } from 'react';
import { useAI } from '@/context/AIContext';
import { Search, X, Sparkles } from 'lucide-react';

export default function SearchBar({
  onSearch,
  delay = 150,
  onSmartOrganize,
}: {
  onSearch: (term: string) => void;
  delay?: number;
  onSmartOrganize?: () => void;
}) {
  const [value, setValue] = useState("");
  const timer = useRef<number | null>(null);
  const { isLoading } = useAI();

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch(v), delay);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="flex gap-3.5 w-full">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10B981]">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search passwords, usernames..."
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-12 bg-white/[0.03] text-white placeholder-white/40 border border-white/[0.08] rounded-[24px] pl-11 pr-10 text-sm focus:outline-none focus:border-[#10B981] focus:bg-white/[0.05] focus:ring-2 focus:ring-[#10B981]/20 hover:bg-white/[0.05] hover:border-white/[0.15] transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {onSmartOrganize && (
        <button
          type="button"
          onClick={onSmartOrganize}
          disabled={isLoading}
          className="hidden md:flex items-center gap-2 h-12 border border-white/10 hover:border-[#10B981] hover:bg-[#10B981]/5 disabled:opacity-50 disabled:pointer-events-none text-white rounded-[24px] px-6 text-sm font-bold transition-all shrink-0"
        >
          <Sparkles className="w-[18px] h-[18px] text-[#10B981]" />
          <span>Organize</span>
        </button>
      )}
    </div>
  );
}
