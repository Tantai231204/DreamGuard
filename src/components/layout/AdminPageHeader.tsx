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
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-5 pb-4 border-b border-gray-100">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-gray-500 hover:text-[var(--color-primary)] transition-colors font-medium hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <Badge variant="secondary" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-semibold px-3 py-1">
                    {crumb.label}
                  </Badge>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5 flex-1">
            {Icon && (
              <div className={cn(
                "h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center shadow-lg ring-4 ring-blue-50 flex-shrink-0",
                iconClassName
              )}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 mt-2 text-base font-medium flex items-center gap-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && stats.length > 0 && (
        <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white px-6 py-5">
          <div className="flex items-center gap-6 flex-wrap">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3 group">
                  {StatIcon && (
                    <div className="h-10 w-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-[var(--color-primary)] group-hover:shadow-md transition-all">
                      <StatIcon className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  {index < stats.length - 1 && (
                    <Separator orientation="vertical" className="h-10 ml-3 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
