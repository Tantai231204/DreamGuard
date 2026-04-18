import { memo, useMemo } from 'react';
import { Phone, Video, MoreVertical, Shield, Star, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Conversation } from '../types';
import { getAvatarGradient } from '../constants';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  conversation: Conversation;
  isTyping?: boolean;
  onResolveConversation?: () => void;
  isResolving?: boolean;
}

function ChatHeaderInner({
  conversation,
  isTyping = false,
  onResolveConversation,
  isResolving = false,
}: ChatHeaderProps) {
  const { customerName, isOnline, status } = conversation;
  const isResolved = status === 'resolved';

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
        <Button
          variant="outline"
          size="sm"
          disabled={isResolved || isResolving || !onResolveConversation}
          onClick={onResolveConversation}
          className="h-7 rounded-md px-2.5 text-[10px] font-semibold mr-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          title={isResolved ? 'Conversation already resolved' : 'Mark conversation as resolved'}
        >
          {isResolving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
          {isResolved ? 'Resolved' : 'Resolve'}
        </Button>

        {/* Conversation status badge */}
        <span
          className={cn(
            'hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2',
            status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
              status === 'pending' ? 'bg-amber-50   text-amber-600   border border-amber-200' :
                status === 'resolved' ? 'bg-gray-100   text-gray-500    border border-gray-200' :
                  'bg-gray-100   text-gray-400    border border-gray-200'
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
          <ChevronDown className="h-2.5 w-2.5" />
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-[var(--color-primary)] transition-all"
          title="Voice call"
        >
          <Phone className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-[var(--color-primary)] transition-all"
          title="Video call"
        >
          <Video className="h-3.5 w-3.5" />
        </Button>

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
          <DropdownMenuContent align="end" className="w-52 shadow-lg rounded-lg border-gray-100">
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer rounded-md">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Mark as priority
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer rounded-md">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              View customer profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isResolved || isResolving || !onResolveConversation}
              onSelect={(event) => {
                event.preventDefault();
                if (!isResolved && !isResolving) {
                  onResolveConversation?.();
                }
              }}
              className="gap-2 text-xs cursor-pointer text-emerald-600 rounded-md focus:text-emerald-600 focus:bg-emerald-50 disabled:opacity-50"
            >
              {isResolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
              {isResolved ? 'Conversation resolved' : 'Mark as resolved'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export const ChatHeader = memo(ChatHeaderInner);
ChatHeader.displayName = 'ChatHeader';
export default ChatHeader;
