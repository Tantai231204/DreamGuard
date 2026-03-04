import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbProps {
    productName: string;
}

export const Breadcrumb = memo(({ productName }: BreadcrumbProps) => {
    return (
        <motion.nav
            className="mb-6 flex items-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Link to="/" className="text-gray-500 transition-colors hover:text-[var(--color-primary)]">
                Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to="/products" className="text-gray-500 transition-colors hover:text-[var(--color-primary)]">
                Products
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[var(--color-primary)]">{productName}</span>
        </motion.nav>
    );
});

Breadcrumb.displayName = 'Breadcrumb';
