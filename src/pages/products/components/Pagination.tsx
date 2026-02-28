import type { FC } from 'react';
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

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleFirst = () => onPageChange(1);
  const handlePrevious = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);
  const handleLast = () => onPageChange(totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <motion.div 
      className={cn('flex items-center justify-center gap-1.5', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* First Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFirst}
          disabled={currentPage === 1}
          className="h-10 w-10 rounded-xl border-gray-200 transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30 disabled:opacity-40"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Previous Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="h-10 w-10 rounded-xl border-gray-200 transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                •••
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <motion.div
              key={page}
              whileHover={{ scale: isActive ? 1 : 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'h-10 w-10 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-hover)]'
                    : 'border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30 hover:text-[var(--color-primary-dark)]'
                )}
              >
                {page}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-10 w-10 rounded-xl border-gray-200 transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Last Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={handleLast}
          disabled={currentPage === totalPages}
          className="h-10 w-10 rounded-xl border-gray-200 transition-all hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30 disabled:opacity-40"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
