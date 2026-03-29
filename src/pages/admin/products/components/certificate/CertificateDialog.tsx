// src/pages/admin/products/components/certificate/CertificateDialog.tsx

import { useEffect, memo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2, ShieldCheck, AlertCircle, Award, Globe } from 'lucide-react';
import type { Certificate, CreateCertificateRequest } from '../../types';
import { getCertificateStyle } from '@/shared/data/certificates';

import { cn } from '@/lib/utils';

const certificateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  organization: z.string().min(2, "Organization name is required"),
  scope: z.string().optional(),
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
      scope: '',
    },
    mode: 'onBlur'
  });

  const { errors, isValid } = form.formState;
  const watchName = useWatch({ control: form.control, name: 'name' });
  const registry = getCertificateStyle(watchName || '');

  useEffect(() => {
    if (open) {
      if (editingCert) {
        form.reset({
          name: editingCert.name,
          summary: editingCert.summary,
          description: editingCert.description,
          organization: editingCert.organization || '',
          scope: editingCert.scope || '',
        });
      } else {
        form.reset({
          name: '',
          summary: '',
          description: '',
          organization: '',
          scope: 'Global Standard',
        });
      }
    }
  }, [open, editingCert, form]);

  const handleFormSubmit = async (data: CreateCertificateRequest) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] w-[95vw] min-h-[500px] h-fit max-h-[90vh] rounded-2xl p-7 flex flex-col gap-0 border-gray-100 shadow-2xl overflow-hidden bg-white">
        {/* Header - System Standard Alignment */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden p-2 transition-all duration-300",
            registry.image ? "bg-white border border-slate-100" : "bg-[#4988c4] text-white"
          )}>
            {registry.image ? (
              <img src={registry.image} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              editingCert ? <Edit2 className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
              {editingCert ? 'Edit Certificate' : 'New Quality Standard'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 font-medium mt-1">
              {editingCert ? 'Modify existing certification metadata and mapping' : 'Define a new verified quality seal for DreamGuard products'}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleFormSubmit)} id="cert-form" className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6 px-1">
          {/* Mapping Alert - Integrated with Registry */}
          {!registry.isDefault && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/10">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-0.5">Registry Synced</p>
                <p className="text-[11px] font-semibold text-emerald-600/90">Identity matched for "<span className="text-emerald-700">{watchName}</span>". Branding will be applied automatically.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate Name */}
            <div className="space-y-2.5">
              <Label htmlFor="cert-name" className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5 pl-1">
                Display Name
                <span className="text-red-500 text-xs">*</span>
              </Label>
              <Input
                id="cert-name"
                placeholder="e.g. OEKO-TEX Standard 100"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium shadow-none"
                {...form.register('name')}
              />
              <ErrorMsg error={errors.name} />
            </div>

            {/* Organization */}
            <div className="space-y-2.5">
              <Label htmlFor="cert-org" className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5 pl-1">
                Issuing Authority
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#4988c4] transition-colors">
                  <Award size={16} />
                </div>
                <Input
                  id="cert-org"
                  placeholder="e.g. Hohenstein Institute"
                  className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-semibold text-slate-900 placeholder:text-slate-300 shadow-none"
                  {...form.register('organization')}
                />
              </div>
              <ErrorMsg error={errors.organization} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scope */}
            <div className="space-y-2.5">
              <Label htmlFor="cert-scope" className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5 pl-1">
                Standard Scope
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#4988c4] transition-colors">
                  <Globe size={16} />
                </div>
                <Input
                  id="cert-scope"
                  placeholder="e.g. Global Standard"
                  className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-semibold text-slate-900 placeholder:text-slate-300 shadow-none"
                  {...form.register('scope')}
                />
              </div>
            </div>

            {/* Short Summary */}
            <div className="space-y-2.5">
              <Label htmlFor="cert-summary" className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
                Status Tag
              </Label>
              <Input
                id="cert-summary"
                placeholder="Brief tag (e.g. Harmful Substances)"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-semibold text-slate-900 placeholder:text-slate-300 shadow-none"
                {...form.register('summary')}
              />
              <ErrorMsg error={errors.summary} />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2.5">
            <Label htmlFor="cert-description" className="text-[11px] font-black text-slate-500 tracking-wider uppercase pl-1">
              Operational Definition
            </Label>
            <Textarea
              id="cert-description"
              placeholder="Full details about testing protocols and safety benefits..."
              className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-medium text-slate-800 p-4 resize-none placeholder:text-slate-300 shadow-none leading-relaxed"
              {...form.register('description')}
            />
            <ErrorMsg error={errors.description} />
          </div>
        </form>

        {/* Footer - Unified Actions */}
        <div className="flex items-center gap-3 pt-5 border-t border-gray-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-medium transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isValid}
            form="cert-form"
            className="flex-1 h-11 rounded-xl font-medium bg-[#4988c4] hover:bg-[#3a6fa0] text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>{editingCert ? "Update Standard" : "Issue Certificate"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
