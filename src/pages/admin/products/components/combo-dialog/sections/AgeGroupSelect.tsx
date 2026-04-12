import { memo } from 'react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SELECT_TRIGGER_CLS } from '../index';
import { AGE_GROUPS } from '../../../types';
import { ErrorMsg, Field } from '../primitives';

interface AgeGroupSelectProps {
    value: string;
    onChange: (v: string) => void;
    error?: { message?: string };
    disabled: boolean;
}

const AgeGroupSelect = memo(function AgeGroupSelect({ value, onChange, error, disabled }: AgeGroupSelectProps) {
    return (
        <Field label="Age group" required>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={SELECT_TRIGGER_CLS}>
                    <SelectValue placeholder="Select age group…" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {Object.entries(AGE_GROUPS).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="rounded-lg py-2 text-sm">
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <ErrorMsg error={error} />
        </Field>
    );
});

export default AgeGroupSelect;
