import { memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { UseFormRegister } from 'react-hook-form';
import type { ComboFormValues } from '../index';
import { ErrorMsg, Field } from '../primitives';

interface DescriptionFieldProps {
    register: UseFormRegister<ComboFormValues>;
    charCount: number;
    error?: { message?: string };
    disabled: boolean;
    placeholder?: string;
}

const DescriptionField = memo(function DescriptionField({
    register,
    charCount,
    error,
    disabled,
    placeholder = "Briefly describe this combo…",
}: DescriptionFieldProps) {
    return (
        <Field label="Short description" required hint={`${charCount}/120`}>
            <Textarea
                {...register('description')}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={120}
                rows={2}
                className={cn(
                    'w-full rounded-lg border border-slate-200 bg-white hover:border-slate-300',
                    'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15',
                    'transition-all text-sm text-slate-900 resize-none p-2.5',
                    error && 'border-red-400',
                )}
            />
            <ErrorMsg error={error} />
        </Field>
    );
});

export default DescriptionField;
