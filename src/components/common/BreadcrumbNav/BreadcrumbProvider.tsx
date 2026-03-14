import { useState, type ReactNode } from "react";
import { BreadcrumbContext, type IBreadcrumbItem } from "./context";

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<IBreadcrumbItem[]>([]);
    
    return (
        <BreadcrumbContext.Provider value={{ items, setItems }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};
