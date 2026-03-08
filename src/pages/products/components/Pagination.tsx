import type { FC, ElementType } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const NavButton = ({
  icon: Icon,
  onClick,
  disabled
}: {
  icon: ElementType,
  onClick: () => void,
  disabled: boolean
}) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="h-14 w-14 rounded-2xl border-gray-100 bg-white shadow-sm transition-all hover:border-gray-950 hover:bg-gray-950 hover:text-white disabled:opacity-30 active:scale-90 group"
  >
    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
  </Button>
);

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <motion.div
      className={cn('flex flex-col sm:flex-row items-center justify-center gap-10', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3">
        <NavButton icon={ChevronsLeft} onClick={() => onPageChange(1)} disabled={currentPage === 1} />
        <NavButton icon={ChevronLeft} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      </div>

      <div className="flex items-center gap-3 px-4">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} className="w-12 text-center text-gray-200 font-black tracking-[0.4em]">•••</span>;
          }

          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(page as number)}
              className={cn(
                'h-14 w-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden',
                isActive
                  ? 'bg-gray-950 text-white shadow-2xl scale-125 z-10'
                  : 'border-gray-100 text-gray-400 bg-white hover:border-gray-950 hover:text-gray-950 active:scale-95'
              )}
            >
              {isActive && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />}
              {page}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <NavButton icon={ChevronRight} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <NavButton icon={ChevronsRight} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
      </div>

      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 sm:absolute sm:right-0">
        Page {currentPage} of {totalPages}
      </div>
    </motion.div>
  );
};
