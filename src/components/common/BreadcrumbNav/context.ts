import { createContext, type ReactNode } from "react";

export interface IBreadcrumbItem {
    label: ReactNode;
    href?: string;
    active?: boolean;
}

export interface BreadcrumbProps {
    items: IBreadcrumbItem[];
    className?: string;
}

interface BreadcrumbContextType {
    items: IBreadcrumbItem[];
    setItems: (items: IBreadcrumbItem[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);