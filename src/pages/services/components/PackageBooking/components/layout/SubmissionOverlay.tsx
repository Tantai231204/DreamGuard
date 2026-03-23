import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { type SubmissionStatus } from "../../types";

interface SubmissionOverlayProps {
  isSubmitting: boolean;
  status: SubmissionStatus;
  progress: number;
}

export default function SubmissionOverlay({ isSubmitting, status, progress }: SubmissionOverlayProps) {
  return (
    <AnimatePresence>
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-xs w-full space-y-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50">
                <Loader2 className="h-10 w-10 text-[#4988c4] animate-spin" />
              </div>
              {status === 'uploading' && (
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">
                  {progress}%
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {status === 'creating' && "Finalizing Your Order..."}
                {status === 'uploading' && "Uploading Condition Evidence..."}
                {status === 'finishing' && "Securing Appointment..."}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {status === 'creating' && "Communicating with our booking engine to secure your slot."}
                {status === 'uploading' && "Sending your photos to our technician team for review."}
                {status === 'finishing' && "Generating your confirmation and preparing redirect."}
              </p>
            </div>

            {status === 'uploading' && (
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Protocol Active</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
