import { AdminActions } from '@/components/admin';

interface ProductTypeActionsProps {
    onAdd: () => void;
    onExport: () => void;
}

export function ProductTypeActions({ onAdd, onExport }: ProductTypeActionsProps) {
    return (
        <AdminActions
            onAdd={onAdd}
            onExport={onExport}
            addLabel="Add Type"
            showFilter={false} // Filter is in the table search already or handled separately
            showImport={false}
        />
    );
}
