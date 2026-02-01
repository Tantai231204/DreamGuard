import { useState, type ReactNode } from "react";
import type { BreadcrumbItem } from "../Breadcrumb";
import { BreadcrumbContext } from "./context";

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<BreadcrumbItem[]>([]);
    return (
        <BreadcrumbContext.Provider value={{ items, setItems }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};


