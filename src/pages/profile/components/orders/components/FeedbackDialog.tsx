import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, ShieldCheck, Loader2, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useCreateProductFeedback } from '@/hooks/queries/useProductFeedback';
import { useCoinRewardConfig } from '@/hooks/queries/useCoinRewardConfig';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductFeedbackResponse } from '@/api/types/feedback';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  orderItemId: string;
  itemName: string;
  itemImage?: string;
  trigger?: React.ReactNode;
  existingFeedback?: ProductFeedbackResponse | null;
}

const RATING_LEVELS = [
  { label: 'Unsatisfactory', color: 'text-gray-400', glow: 'shadow-gray-200' },
  { label: 'Below Average', color: 'text-orange-400', glow: 'shadow-orange-200' },
  { label: 'Good Experience', color: 'text-amber-400', glow: 'shadow-amber-200' },
  { label: 'Very Impressive', color: 'text-yellow-400', glow: 'shadow-yellow-200' },
  { label: 'Exquisite Quality', color: 'text-yellow-500', glow: 'shadow-yellow-400' },
];

export function FeedbackDialog({ orderItemId, itemName, itemImage, trigger, existingFeedback }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverScore, setHoverScore] = useState(0);
  const { mutate: createFeedback, isPending } = useCreateProductFeedback();
  const { feedbackCoin } = useCoinRewardConfig();
  const toast = useToast();

  const isReadOnly = !!existingFeedback;

  useEffect(() => {
    if (existingFeedback) {
      queueMicrotask(() => {
        setScore(existingFeedback.score);
        setComment(existingFeedback.comment || '');
      });
    }
  }, [existingFeedback]);

  const handleSubmit = () => {
    if (score === 0) {
      toast.error('Required', 'Please select a rating score.');
      return;
    }

    createFeedback(
      {
        orderItemId,
        payload: { score, comment },
      },
      {
        onSuccess: () => {
          toast.success('Feedback Submitted', `Thank you for rating ${itemName}.`);
          setOpen(false);
          setComment('');
        },
        onError: () => {
          // Global mutation cache handles the error toast
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-8 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-full border",
              isReadOnly 
                ? "text-slate-400 border-slate-200 hover:bg-slate-50" 
                : "text-[#4988c4] border-[#4988c4]/20 hover:text-white hover:bg-[#4988c4]"
            )}
          >
            {isReadOnly ? 'View Review' : 'Review Item'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-slate-200/60 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.15)] rounded-[2.5rem] bg-white">
        {/* Lighter, Refined Header */}
        <div className="relative pt-10 pb-6 px-8 text-center border-b border-slate-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-[#4988c4]/10 rounded-full"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner">
               <Sparkles className="w-6 h-6 text-[#4988c4]" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-[#4988c4] uppercase tracking-[0.3em]">Customer Feedback</h2>
              <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {isReadOnly ? 'Your Submitted Review' : 'Evaluate your Item'}
              </DialogTitle>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Enhanced Product Context */}
          <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50/50 border border-slate-100/80">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
              {itemImage ? (
                <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
              ) : (
                <MessageSquare className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-[#4988c4] uppercase tracking-[0.15em] mb-1">
                {isReadOnly ? 'Verified Feedback' : 'Authenticated Purchase'}
              </p>
              <h4 className="text-[15px] font-bold text-slate-800 leading-tight line-clamp-2">{itemName}</h4>
            </div>
          </div>

          {/* Reward Awareness UI */}
          {!isReadOnly && (
            <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/50 -mt-4 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">
                Earn <span className="text-emerald-800">+{feedbackCoin} coins</span> for this review
              </p>
            </div>
          )}

          {/* Enhanced Rating Stars */}
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={score || hoverScore}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`text-[12px] font-black uppercase tracking-[0.15em] ${RATING_LEVELS[(hoverScore || score) - 1]?.color || 'text-slate-300'}`}
                >
                  {RATING_LEVELS[(hoverScore || score) - 1]?.label || 'Set your rating'}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverScore || score) >= star
                
                return (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={isReadOnly ? {} : { scale: 1.2 }}
                    whileTap={isReadOnly ? {} : { scale: 0.9 }}
                    className={cn("relative outline-none", isReadOnly && "cursor-default")}
                    onMouseEnter={() => !isReadOnly && setHoverScore(star)}
                    onMouseLeave={() => !isReadOnly && setHoverScore(0)}
                    onClick={() => !isReadOnly && setScore(star)}
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-all duration-300",
                        isActive
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)]'
                          : 'text-slate-200 fill-transparent'
                      )}
                      strokeWidth={isActive ? 1.5 : 1}
                    />
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Refined Selection Feedback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional Review</label>
              <span className="text-[9px] font-bold text-slate-300">{comment.length}/500</span>
            </div>
            <Textarea
              placeholder={isReadOnly ? "No additional comments provided." : "What made this item special to you?"}
              className="min-h-[120px] resize-none border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-2 focus:ring-[#4988c4]/10 focus:border-[#4988c4]/30 transition-all rounded-[1.5rem] p-5 text-[14px] text-slate-600 shadow-sm"
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          {/* Integrated Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={isReadOnly ? () => setOpen(false) : handleSubmit}
              disabled={isPending}
              className={cn(
                "w-full h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.25rem] shadow-lg transition-all active:scale-[0.98]",
                isReadOnly 
                  ? "bg-slate-900 hover:bg-black text-white shadow-slate-200" 
                  : "bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-[#4988c4]/20"
              )}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isReadOnly ? (
                <>
                  Close Review
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Confirm Review
                  <ShieldCheck className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            {!isReadOnly && (
              <button
                onClick={() => setOpen(false)}
                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
