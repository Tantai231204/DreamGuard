// src/pages/admin/products/components/certificate/CertificateDialog.tsx

import { useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Certificate, CreateCertificateRequest } from '../../types';

const certificateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  organization: z.string(),
});

const ErrorMsg = memo(({ error }: { error?: { message?: string } }) => {
  if (!error) return null;
  return (
    <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5 px-1 animate-in fade-in duration-200">
      <AlertCircle className="h-3 w-3" />
      {error.message}
    </p>
  );
});

interface CertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCert: Certificate | null;
  onSubmit: (data: CreateCertificateRequest) => Promise<void>;
  isPending: boolean;
}

export function CertificateDialog({
  open, onOpenChange, editingCert, onSubmit, isPending
}: CertificateDialogProps) {
  const form = useForm<CreateCertificateRequest>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      name: '',
      summary: '',
      description: '',
      organization: '',
    },
    mode: 'onBlur'
  });

  const { errors, isValid } = form.formState;

  useEffect(() => {
    if (open) {
      if (editingCert) {
        form.reset({
          name: editingCert.name,
          summary: editingCert.summary,
          description: editingCert.description,
          organization: editingCert.organization || '',
        });
      } else {
        form.reset({
          name: '',
          summary: '',
          description: '',
          organization: '',
        });
      }
    }
  }, [open, editingCert, form]);

  const handleFormSubmit = async (data: CreateCertificateRequest) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] w-[95vw] h-[740px] max-h-[90vh] rounded-2xl p-7 flex flex-col gap-0 border-slate-100 shadow-2xl overflow-hidden bg-white">
        {/* Header - Standardized with other dialogs */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100/60 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0 text-white">
            {editingCert ? <Edit2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
              {editingCert ? 'Edit Certificate' : 'Create Certificate'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium mt-1">
              {editingCert ? 'Modify existing certification details for your products.' : 'Add a new quality or safety standard certification.'}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
          {/* Certificate Name */}
          <div className="space-y-2.5">
            <Label htmlFor="cert-name" className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5 pl-1">
              Certificate Name
              <span className="text-red-500 text-xs">*</span>
            </Label>
            <Input
              id="cert-name"
              placeholder="e.g. ASTM F963-17 Safety Standard"
              className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100/20 transition-all font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-medium shadow-none"
              {...form.register('name')}
            />
            <ErrorMsg error={errors.name} />
          </div>

          {/* Short Summary */}
          <div className="space-y-2.5">
            <Label htmlFor="cert-summary" className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
              Short Summary
            </Label>
            <Input
              id="cert-summary"
              placeholder="Brief overview of the certification's scope..."
              className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100/20 transition-all font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-medium shadow-none"
              {...form.register('summary')}
            />
            <ErrorMsg error={errors.summary} />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2.5">
            <Label htmlFor="cert-description" className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
              Detailed Description
            </Label>
            <Textarea
              id="cert-description"
              placeholder="Full details about process, authority, and safety benefits..."
              className="min-h-[140px] rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100/20 transition-all font-medium text-slate-800 p-4 resize-none placeholder:text-slate-300 shadow-none leading-relaxed"
              {...form.register('description')}
            />
            <ErrorMsg error={errors.description} />
          </div>
        </form>

        {/* Footer - Standardized Action Bar */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isValid}
            form={undefined} // Form is wrapping this button
            onClick={form.handleSubmit(handleFormSubmit)}
            className="flex-[1.5] h-12 rounded-xl font-black bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>{editingCert ? "Update Changes" : "Create Certificate"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
