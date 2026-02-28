import { createContext } from "react";
import type { BreadcrumbItem } from "../Breadcrumb";

interface BreadcrumbContextType {
    items: BreadcrumbItem[];
    setItems: (items: BreadcrumbItem[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);