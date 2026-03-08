import { cn } from '@/lib/utils';

export const INPUT_CLS =
    'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-[#4988c4]/60 hover:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all';

export const SELECT_CLS = cn(
    INPUT_CLS,
    'px-3.5 [&>span]:!flex [&>span]:!items-center [&>span]:!gap-2',
);

export const TEXTAREA_CLS =
    'rounded-xl border-gray-200 bg-gray-50/50 hover:border-[#4988c4]/60 hover:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 resize-none transition-all';
