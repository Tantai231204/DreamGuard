import { motion } from 'framer-motion';
import { Check, Droplets, Bed, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TradeInAudit } from '../types';

interface StepAuditProps {
  audit: TradeInAudit;
  onToggle: (key: keyof TradeInAudit) => void;
}

const AUDIT_ITEMS: Array<{
  key: keyof TradeInAudit;
  label: string;
  desc: string;
  Icon: React.ElementType;
}> = [
  {
    key: 'hygienic',
    label: 'No severe stains or odours',
    desc: 'Free from biological stains or persistent odours',
    Icon: Droplets,
  },
  {
    key: 'noSagginess',
    label: 'Core is not collapsed or deformed',
    desc: 'Internal structure retains its original shape',
    Icon: Bed,
  },
  {
    key: 'surfaceIntegrity',
    label: 'Cover fabric is intact',
    desc: 'No significant tears, fraying, or surface damage',
    Icon: ShieldCheck,
  },
];

export function StepAudit({ audit, onToggle }: StepAuditProps) {
  return (
    <motion.div
      key="step-audit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-5">
        <h3 className="font-serif italic text-[20px] text-gray-900 font-normal leading-tight">
          Confirm item condition
        </h3>
        <p className="text-[11.5px] text-[#8C7A6B] mt-1">
          Be honest — your credit estimate depends on it
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {AUDIT_ITEMS.map(({ key, label, desc, Icon }) => {
          const checked = audit[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200',
                checked
                  ? 'bg-[#F2F7F2] border-[#4A5D4E] shadow-[0_2px_16px_rgba(74,93,78,0.09)]'
                  : 'bg-white border-[#EDE8E1] hover:border-[#4A5D4E]/40 hover:bg-[#FDFCFA]'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  checked ? 'bg-[#3D5140] shadow-[0_4px_12px_rgba(61,81,64,0.25)]' : 'bg-[#F5F2EE]'
                )}
              >
                <Icon className={cn('w-5 h-5', checked ? 'text-white' : 'text-[#8C7A6B]')} />
              </div>

              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-900 leading-snug">{label}</p>
                <p className="text-[11px] text-[#A89E94] mt-0.5 leading-relaxed">{desc}</p>
              </div>

              <div
                className={cn(
                  'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  checked
                    ? 'bg-[#3D5140] border-[#3D5140]'
                    : 'border-[#D0C8BF] bg-white'
                )}
              >
                <Check
                  className={cn(
                    'w-2.5 h-2.5 text-white stroke-[3] transition-all duration-150',
                    checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Hygiene warning */}
      <div
        className={cn(
          'mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5',
          'transition-all duration-200 overflow-hidden',
          audit.hygienic === false ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 mt-0 py-0 border-0'
        )}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Items not meeting hygiene standards will be responsibly recycled.
          Credit is adjusted to <strong>20%</strong> of the base value.
        </p>
      </div>
    </motion.div>
  );
}
