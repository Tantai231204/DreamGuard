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
    className="h-12 w-12 rounded-2xl border-primary-light/40 bg-white shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30 active:scale-95 group"
  >
    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
      className={cn('flex flex-col sm:flex-row items-center justify-center gap-8 py-8', className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2">
        <NavButton icon={ChevronsLeft} onClick={() => onPageChange(1)} disabled={currentPage === 1} />
        <NavButton icon={ChevronLeft} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      </div>

      <div className="flex items-center gap-2 px-2">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="w-8 text-center text-primary-light font-bold tracking-widest text-xs">
                ...
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(page as number)}
              className={cn(
                'h-12 w-12 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10'
                  : 'border-primary-light/40 text-primary-light bg-white hover:border-primary hover:text-primary active:scale-95'
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <NavButton icon={ChevronRight} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <NavButton icon={ChevronsRight} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
      </div>

      <div className="text-[11px] font-bold text-primary-light sm:absolute sm:right-0 tracking-wide">
        Page <span className="text-primary-dark font-extrabold">{currentPage}</span> of {totalPages}
      </div>
    </motion.div>
  );
};
