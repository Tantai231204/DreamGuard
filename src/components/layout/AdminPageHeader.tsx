import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
  }[];
}

export default function AdminPageHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  breadcrumbs,
  actions,
  stats,
}: AdminPageHeaderProps) {
  // Default breadcrumbs if not provided
  const defaultBreadcrumbs = breadcrumbs || [
    { label: 'Dashboard', href: '/admin' },
    { label: title },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-2">
            {defaultBreadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-gray-500 hover:text-[var(--color-primary)] transition-colors font-medium hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white font-semibold px-3 py-1"
                  >
                    {crumb.label}
                  </Badge>
                )}
                {index < defaultBreadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                )}
              </div>
            ))}
          </nav>

          {/* Title */}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center shadow-lg">
                <Icon className={cn("h-6 w-6 text-white", iconClassName)} />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-4">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center px-4 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1 justify-center">
                    {StatIcon && (
                      <StatIcon className="h-4 w-4 text-[var(--color-primary)]" />
                    )}
                    <span className="text-xs text-gray-500 font-semibold uppercase">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">
                    {stat.value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 ml-4">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
