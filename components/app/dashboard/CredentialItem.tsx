import { useState } from 'react';
import type { Credentials } from '@/lib/appwrite/types';
import { Shield, ExternalLink, Copy, Edit2, Trash2, MoreVertical, User, Lock, Pin } from 'lucide-react';

export default function CredentialItem({
  credential,
  onCopy,
  _isDesktop,
  onEdit,
  onDelete,
  onClick,
  onTogglePin,
  isBlurEnabled = false,
}: {
  credential: Credentials;
  onCopy: (value: string) => void;
  _isDesktop?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
  onTogglePin?: () => void;
  isBlurEnabled?: boolean;
}) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const handleCopy = (value: string) => {
    onCopy(value);
    setShowCopyMenu(false);
  };

  const getFaviconUrl = (url: string | null | undefined) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(credential.url);

  return (
    <div
      onClick={onClick}
      className="group px-[18px] py-[14px] mb-3 rounded-[24px] bg-[#161412] border border-[#34322F] cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-[12px] shadow-[0_4px_4px_-4px_rgba(0,0,0,0.9),0_2px_3px_-3px_rgba(37,35,33,0.9)] hover:bg-[#1C1A18] hover:border-[#10B981]/20 hover:-translate-y-0.5 hover:shadow-[0_8px_10px_-8px_rgba(0,0,0,1),0_6px_8px_-6px_rgba(37,35,33,1.0)]"
    >
      {/* Icon */}
      <div 
        className="w-[52px] h-[52px] rounded-[16px] bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/[0.05] overflow-hidden transition-all duration-300 group-hover:border-[#10B981]/20 group-hover:bg-[#10B981]/5"
      >
        {faviconUrl ? (
          <img src={faviconUrl} className="w-8 h-8 object-contain" alt="" />
        ) : (
          <span className="font-black text-[#10B981] text-[1.3rem] font-clash">
            {credential.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-[3px] pr-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {credential.isPinned && <Pin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 fill-[#F59E0B]" />}
          <span className="font-black text-white leading-tight font-clash text-base truncate">
            {credential.name}
          </span>
        </div>
        <span 
          className="text-[#9B9691] font-medium text-[0.85rem] leading-[1.35] font-satoshi truncate transition-[filter] duration-300"
          style={{ filter: isBlurEnabled ? 'blur(4.5px)' : 'none' }}
        >
          {credential.username}
        </span>
        {(credential as any).sharedFrom && (
          <div className="mt-1 h-5 text-[0.62rem] font-black bg-[#10B981]/10 text-[#10B981] rounded-[6px] px-2 py-0.5 uppercase tracking-[0.02em] inline-flex items-center w-fit">
            Received from {(credential as any).sharedFrom}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-1">
          <button 
            onClick={() => handleCopy(credential.username || '')}
            title="Copy Username"
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-[18px] h-[18px]" />
          </button>

          <button 
            onClick={() => handleCopy(credential.password || '')}
            title="Copy Secret"
            className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
          >
            <Lock className="w-[18px] h-[18px]" />
          </button>

          <button 
            onClick={onEdit}
            title="Edit Record"
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Edit2 className="w-[18px] h-[18px]" />
          </button>

          <button 
            onClick={onDelete}
            title="Destroy"
            className="p-1.5 rounded-lg text-white/15 hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors"
          >
            <Trash2 className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-1">
          <button 
            onClick={() => setShowCopyMenu(!showCopyMenu)}
            className="p-1.5 rounded-lg text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-1.5 rounded-lg text-[#9B9691] hover:bg-white/5 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Dropdown Menu */}
        {showCopyMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowCopyMenu(false)} 
            />
            <div 
              className="absolute right-0 top-8 z-50 min-w-[200px] py-1 bg-[#161412] border border-[#34322F] rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <button 
                onClick={() => { handleCopy(credential.username || ''); }} 
                className="w-full text-left py-2.5 px-5 flex items-center gap-3 hover:bg-white/5 transition-colors text-white font-semibold text-xs"
              >
                <User className="w-4.5 h-4.5 text-[#9B9691]" />
                <span>Copy Username</span>
              </button>
              <button 
                onClick={() => { handleCopy(credential.password || ''); }} 
                className="w-full text-left py-2.5 px-5 flex items-center gap-3 hover:bg-white/5 transition-colors text-[#10B981] font-semibold text-xs"
              >
                <Lock className="w-4.5 h-4.5 text-[#10B981]" />
                <span>Copy Secret</span>
              </button>
            </div>
          </>
        )}

        {/* Action Dropdown Menu */}
        {showActionMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowActionMenu(false)} 
            />
            <div 
              className="absolute right-0 top-8 z-50 min-w-[180px] py-1 bg-[#161412] border border-[#34322F] rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <button 
                onClick={() => { onEdit(); setShowActionMenu(false); }} 
                className="w-full text-left py-2.5 px-5 flex items-center gap-3 hover:bg-white/5 transition-colors text-white font-semibold text-xs"
              >
                <Edit2 className="w-4.5 h-4.5 text-[#9B9691]" />
                <span>Edit Record</span>
              </button>
              <button 
                onClick={() => { onTogglePin?.(); setShowActionMenu(false); }} 
                className="w-full text-left py-2.5 px-5 flex items-center gap-3 hover:bg-white/5 transition-colors text-white font-semibold text-xs"
              >
                <Pin className={`w-4.5 h-4.5 ${credential.isPinned ? 'text-[#F59E0B]' : 'text-[#9B9691]'}`} />
                <span>{credential.isPinned ? 'Unpin Secret' : 'Pin Secret'}</span>
              </button>
              <button 
                onClick={() => { onDelete(); setShowActionMenu(false); }} 
                className="w-full text-left py-2.5 px-5 flex items-center gap-3 hover:bg-[#FF453A]/10 transition-colors text-[#FF453A] font-semibold text-xs"
              >
                <Trash2 className="w-4.5 h-4.5 text-[#FF453A]" />
                <span>Destroy</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
