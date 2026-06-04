'use client';

import React, { useEffect, useState } from 'react';
import { useDynamicSidebar } from '@/components/ui/DynamicSidebar';
import { X as CloseIcon, ArrowLeft as BackIcon } from 'lucide-react';

export function DynamicSidebar() {
  const { isOpen, content, closeSidebar, options } = useDynamicSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Disable scroll on body when open on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const isNoteDetail = content && React.isValidElement(content) && (
    (typeof content.type === 'function' && content.type.name === 'NoteDetailSidebar') ||
    (typeof content.type === 'object' && content.type !== null && (content.type as any).type?.name === 'NoteDetailSidebar') ||
    (content.props as any)?.note !== undefined
  );

  const shouldHideHeader = options?.hideHeader || isNoteDetail;

  return (
    <>
      {/* Backdrop (Only for desktop or non-fullscreen) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[9990] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } md:block hidden`}
        onClick={closeSidebar}
      />

      {/* Slide-over Container */}
      <div 
        className={`fixed right-0 top-0 bottom-0 h-dvh bg-[#161412] flex flex-col z-[9995] shadow-2xl transition-transform duration-300 ease-out border-l border-white/5 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full md:w-[450px] lg:w-[500px]`}
      >
        {!shouldHideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#161412] shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSidebar}
                className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/5 md:hidden"
              >
                <BackIcon className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold font-space-grotesk text-[#6366F1] uppercase tracking-wider text-sm md:text-base">
                Details
              </h3>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/5 md:inline-flex hidden"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={`flex-1 min-h-0 bg-[#161412] ${isNoteDetail ? 'overflow-hidden' : 'overflow-y-auto scrollbar-thin'}`}>
          {content}
        </div>
      </div>
    </>
  );
}
