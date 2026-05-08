import { memo, useMemo } from 'react';
import { MoreVertical, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { Conversation } from '../types';
import { getAvatarGradient } from '../constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useCustomerDetail } from '@/hooks/queries/useCustomer';
import { CustomerDetailDialog } from '../../users/components/CustomerDetailDialog';
import type { User } from '../../users/types';

interface ChatHeaderProps {
  conversation: Conversation;
  isTyping?: boolean;
}

function ChatHeaderInner({
  conversation,
  isTyping = false,
}: ChatHeaderProps) {
  const { customerName, isOnline, customerId } = conversation;
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch customer detail only when requested via dialog
  const { data: customerData } = useCustomerDetail(customerId, isDetailOpen);

  const gradient = useMemo(() => getAvatarGradient(customerName), [customerName]);
  const initials = useMemo(
    () =>
      customerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [customerName]
  );

  const statusLabel = isTyping
    ? 'Typing…'
    : isOnline !== false
      ? 'Online'
      : 'Offline';

  return (
    <div className="chat-glass-header flex-shrink-0 px-5 py-3 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center',
              'text-white font-bold text-sm shadow-md select-none bg-gradient-to-br',
              gradient
            )}
          >
            {initials}
          </div>
          {isOnline !== false && (
            <span className="online-dot absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{customerName}</h3>
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                isTyping ? 'bg-amber-400 animate-pulse' : isOnline !== false ? 'bg-emerald-400' : 'bg-gray-300'
              )}
            />
            {statusLabel}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-0.5">

        {/* Conversation status badge */}
        <span
          className={cn(
            'hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2',
            conversation.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              conversation.status === 'pending' ? 'bg-amber-50   text-amber-600   border border-amber-200' :
                conversation.status === 'resolved' ? 'bg-gray-100   text-gray-500    border border-gray-200' :
                  'bg-gray-100   text-gray-400    border border-gray-200'
          )}
        >
          {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
        </span>

        {/* Call actions removed as they have no task implementation */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-[var(--color-primary)] transition-all"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 shadow-2xl rounded-2xl border-slate-100 p-1.5 animate-in fade-in zoom-in duration-200">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Customer Data
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="gap-3 px-3 py-2.5 text-xs font-semibold cursor-pointer rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setIsDetailOpen(true)}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span>View Full Profile</span>
                <span className="text-[10px] font-normal text-slate-400">Review account & orders</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CustomerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={customerData as User}
      />
    </div>
  );
}

export const ChatHeader = memo(ChatHeaderInner);
ChatHeader.displayName = 'ChatHeader';
export default ChatHeader;
