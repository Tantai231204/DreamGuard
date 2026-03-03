import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

/* ─── Types ───────────────────────────────────────────── */
export interface AttributeField {
    key: string;
    value: string;
}

interface AttributesEditorProps {
    attributes: AttributeField[];
    onChange: (attributes: AttributeField[]) => void;
    disabled?: boolean;
}

/* ─── Constants ───────────────────────────────────────── */
const INPUT_CLS =
    'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all';

/* ─── Component ───────────────────────────────────────── */
export default function AttributesEditor({
    attributes,
    onChange,
    disabled = false,
}: AttributesEditorProps) {
    const handleAdd = useCallback(() => {
        onChange([...attributes, { key: '', value: '' }]);
    }, [attributes, onChange]);

    const handleRemove = useCallback((index: number) => {
        onChange(attributes.filter((_, i) => i !== index));
    }, [attributes, onChange]);

    const handleChange = useCallback((index: number, field: 'key' | 'value', newValue: string) => {
        onChange(attributes.map((attr, i) =>
            i === index ? { ...attr, [field]: newValue } : attr
        ));
    }, [attributes, onChange]);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <SectionHeading title="Custom Attributes" />
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={disabled}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>
            
            {attributes.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No custom attributes added</p>
            ) : (
                <div className="space-y-3">
                    {attributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Input
                                placeholder="Key (e.g. material)"
                                value={attr.key}
                                onChange={(e) => handleChange(index, 'key', e.target.value)}
                                disabled={disabled}
                                className={cn(INPUT_CLS, 'flex-1')}
                            />
                            <Input
                                placeholder="Value (e.g. cotton)"
                                value={attr.value}
                                onChange={(e) => handleChange(index, 'value', e.target.value)}
                                disabled={disabled}
                                className={cn(INPUT_CLS, 'flex-1')}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
