import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
  showPageSize?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSize = true,
}: PaginationControlsProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  const getPageNumbers = () => {
    const range: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        range.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return range;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-white/5 w-full">
      {/* Information and Page Size Selection */}
      <div className="flex items-center gap-6">
        <span className="text-xs text-white/50 font-medium">
          Showing {startItem}-{endItem} of {totalItems} credentials
        </span>
        
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">
              Per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="h-8 text-xs bg-[#161412] text-white border border-white/10 rounded-lg px-2.5 outline-none cursor-pointer hover:border-white/20 focus:border-[#10B981] disabled:opacity-50 transition-all"
            >
              <option value={10} className="bg-[#161412] text-white">10</option>
              <option value={20} className="bg-[#161412] text-white">20</option>
              <option value={50} className="bg-[#161412] text-white">50</option>
              <option value={100} className="bg-[#161412] text-white">100</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Page Numbers */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-1.5 rounded-lg border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Buttons */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-xs text-white/30 select-none">
                ...
              </span>
            );
          }

          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(Number(pageNum))}
              disabled={loading}
              className={`h-8 min-w-[32px] px-2 text-xs rounded-lg border font-medium transition-all ${
                isActive
                  ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 font-bold'
                  : 'border-white/[0.08] text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-1.5 rounded-lg border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
