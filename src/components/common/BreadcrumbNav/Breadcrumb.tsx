import * as React from "react"
import { Home, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    Breadcrumb as BreadcrumbRoot,
    BreadcrumbList,
    BreadcrumbItem as BreadcrumbUIItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./components"
import { type BreadcrumbProps } from "./context"

/**
 * Unified Breadcrumb component for DreamGuard.
 */
export const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
    if (!items || items.length === 0) return null;

    return (
        <BreadcrumbRoot className={cn("group", className)}>
            <BreadcrumbList>
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    const isHome = idx === 0;
                    
                    return (
                        <React.Fragment key={idx}>
                            <BreadcrumbUIItem>
                                {item.href && !isLast ? (
                                    <BreadcrumbLink asChild>
                                        <Link to={item.href} className="flex items-center gap-1.5 transition-colors">
                                            {isHome && <Home className="h-3.5 w-3.5" />}
                                            {item.label}
                                        </Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage className="flex items-center gap-1.5 transition-all outline-none">
                                        {isHome && <Home className="h-3.5 w-3.5" />}
                                        {item.label}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbUIItem>
                            {!isLast && (
                                <BreadcrumbSeparator>
                                    <ChevronRight strokeWidth={2} className="opacity-50" />
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </BreadcrumbRoot>
    );
};
