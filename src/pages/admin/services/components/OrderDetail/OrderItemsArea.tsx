import {
  useState,
  memo,
  useMemo,
  useCallback
} from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eye,
  Clock,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Camera,
  Briefcase,
  AlertCircle,
  Star,
  Quote,
  CreditCard,
  Wallet
} from 'lucide-react';
import { AdminStatusBadge } from '@/components/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { UseQueryResult } from '@tanstack/react-query';
import type { DetailOrder, ExtendedServiceItemDetail, TaskDetail, ServicePackageMappingResponse } from './types';

interface OrderItemsAreaProps {
  order: DetailOrder;
  orderItems: ExtendedServiceItemDetail[];
  mappingQueries: UseQueryResult<ServicePackageMappingResponse, Error>[];
  task?: TaskDetail;
  customerAssets?: string[];
}

export const OrderItemsArea = memo(function OrderItemsArea({ 
  order,
  orderItems, 
  mappingQueries, 
  task, 
  customerAssets 
}: OrderItemsAreaProps) {
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [viewerData, setViewerData] = useState<{ images: string[], index: number } | null>(null);

  const { displayedItems, remainingPackagesCount } = useMemo(() => ({
    displayedItems: showAllPackages ? orderItems : orderItems.slice(0, 2),
    remainingPackagesCount: Math.max(0, orderItems.length - 2)
  }), [showAllPackages, orderItems]);

  // Optimized Evidence Image Collector
  const evidenceImages = useMemo(() => [
    task?.checkInImage || task?.checkinImage || task?.checkinUrl || task?.checkInUrl,
    task?.checkOutImage || task?.checkoutImage || task?.checkoutUrl || task?.checkOutUrl,
    ...(task?.evidences || []).map(ev => ev.imageUrl || ev.imageURL || ev.url || ev.photoUrl)
  ].filter(Boolean) as string[], [task]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewerData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        index: (prev.index + 1) % prev.images.length
      };
    });
  }, []);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewerData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        index: (prev.index - 1 + prev.images.length) % prev.images.length
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* PROFESSIONAL SERVICE PACKAGES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" /> Professional Service Packages
          </h3>
          <Badge variant="secondary" className="text-[9px] font-bold text-slate-500 bg-slate-50 border-slate-200/60 border rounded-full h-6 px-3">
            {orderItems.length} {orderItems.length > 1 ? 'Services' : 'Service'}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {(displayedItems as ExtendedServiceItemDetail[]).map((item: ExtendedServiceItemDetail, index) => {
            const mappingData = mappingQueries[index]?.data;
            const isLoadingMapping = mappingQueries[index]?.isLoading;
            const benefits = mappingData?.servicePackage?.benefits?.split('\r\n') || [];

            return (
              <div key={item.servicePackageMappingId || index} className="flex flex-col lg:flex-row gap-4 p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group hover:shadow-sm relative items-center">

                {/* Compact Visual Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-50 bg-slate-50 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300">
                  {mappingData?.servicePackage?.imageUrl ? (
                    <img src={mappingData.servicePackage.imageUrl} alt="Pkg" className="w-full h-full object-contain mix-blend-multiply transition-all" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-slate-300" />
                  )}
                  {/* Compact Quantity Badge */}
                  <div className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white font-black text-[8px] shadow-sm ring-1 ring-white z-10">
                    {item.quantity || 1}
                  </div>
                </div>

                {/* Streamlined Content Area */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">
                        {mappingData?.servicePackage?.packageName || item.servicePackageName || (isLoadingMapping ? 'Synching...' : 'Standard Package')}
                      </h4>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-full hidden sm:flex shrink-0">
                        {mappingData?.productType?.productTypeName || item.productTypeName}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-[#4988c4] tabular-nums shrink-0 tracking-tight">
                      {formatPrice(mappingData?.price ?? item.unitPrice ?? 0)}
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                      <Clock className="h-3 w-3 text-slate-300" />
                      <span>{mappingData?.duration || mappingData?.servicePackage?.duration || '30'} mins</span>
                    </div>

                    {/* Inline Minimal Benefits */}
                    {benefits.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center border-l border-slate-100 pl-4 ml-0.5">
                        {benefits.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1 text-[9px] text-slate-500 font-medium leading-none">
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {remainingPackagesCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllPackages(!showAllPackages)}
            className="w-full h-11 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest gap-2 transition-all border border-dashed border-slate-200"
          >
            {showAllPackages ? (
              <> <ChevronUp className="h-4 w-4" /> SHOW SUMMARIZED LIST </>
            ) : (
              <> <ChevronDown className="h-4 w-4" /> VIEW {remainingPackagesCount} MORE PACKAGES </>
            )}
          </Button>
        )}
      </div>

      {/* MEDIA DOSSIER - Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* REFERENCE ASSETS (Before/Context) */}
        {customerAssets && customerAssets.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-400" /> Reference Assets
              </h3>
              <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100 rounded-full h-5 px-3 uppercase tracking-tighter">
                {customerAssets.length} Docs
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {customerAssets.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setViewerData({ images: customerAssets, index: idx })}
                  className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all hover:scale-105"
                >
                  <img
                    src={url}
                    alt={`c-asset-${idx}`}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VALIDATION EVIDENCE (After/Results) */}
        {task && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 h-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-400" /> Validation Proof
              </h3>
              <Badge variant="secondary" className="bg-blue-50/50 text-[#4988c4] border-blue-100 border font-bold text-[9px] h-5 px-2 rounded-lg">
                {evidenceImages.length} Proofs
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                {/* Check-In/Out Thumbnails */}
                {[
                  { url: task.checkInImage || task.checkinImage || task.checkinUrl || task.checkInUrl, label: 'Entry' },
                  { url: task.checkOutImage || task.checkoutImage || task.checkoutUrl || task.checkOutUrl, label: 'Exit' }
                ].map((img, i) => img.url && (
                  <div
                    key={`fixed-${i}`}
                    onClick={() => setViewerData({ images: evidenceImages, index: i })}
                    className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all hover:scale-105"
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                    <div className="absolute top-0 right-0 p-1">
                      <div className="bg-black/50 text-white rounded-md h-3.5 px-1.5 flex items-center justify-center font-black text-[6px] uppercase tracking-tighter shadow-sm border border-white/20">
                        {img.label}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Additional Evidence Gallery */}
                {(task.evidences || []).map((ev, idx) => (
                  <div
                    key={ev.seId || idx}
                    onClick={() => {
                      const offset = (task.checkInImage || task.checkinImage || task.checkinUrl || task.checkInUrl ? 1 : 0) +
                        (task.checkOutImage || task.checkoutImage || task.checkoutUrl || task.checkOutUrl ? 1 : 0);
                      setViewerData({ images: evidenceImages, index: offset + idx });
                    }}
                    className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all hover:scale-105"
                  >
                    <img src={ev.imageUrl || ev.imageURL || ev.url || ev.photoUrl || ""} alt="ev" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                      <Maximize2 className="h-3 w-3 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SETTLEMENT & FINAL OUTCOME */}
      <div className="pt-2">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6 relative overflow-hidden">
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-blue-50/50 flex items-center justify-center border border-blue-100/50 shadow-sm shadow-blue-100/10">
                   <CreditCard className="h-5 w-5 text-[#4988c4]" />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black text-[#4988c4] uppercase tracking-[0.2em]">Financial Vault</h3>
                    <p className="text-sm font-bold text-slate-900">Settlement Dossier</p>
                 </div>
              </div>
              <Badge variant="outline" className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-slate-100 h-6 px-3 rounded-full bg-slate-50/30">System Verified</Badge>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Revenue & Payment Info */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="space-y-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block">Total Revenue</span>
                   <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{formatPrice(order.totalPrice || 0)}</p>
                 </div>

                 <div className="space-y-4 pt-1">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block">Payment Method</span>
                       <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                          {String(order.paymentMethod || '').toLowerCase().includes('vnpay') ? (
                             <img src={`${import.meta.env.BASE_URL}images/vnpay.svg`} alt="vnpay" className="h-5 w-5 transition-transform hover:scale-110" />
                          ) : String(order.paymentMethod || '').toLowerCase().includes('cod') ? (
                             <img src={`${import.meta.env.BASE_URL}images/cod.svg`} alt="cod" className="h-5 w-5 transition-transform hover:scale-110" />
                          ) : <Wallet className="h-5 w-5 text-slate-400" />}
                          <span className="text-[12px] font-black uppercase text-slate-700 tracking-tight">{order.paymentMethod || 'COD'}</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block">Payment Status</span>
                       <div className="flex items-center gap-2">
                          <AdminStatusBadge status={order.paymentStatus || ''} mode="payment" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Feedback Section */}
              <div className="lg:col-span-2">
                 {order.rating ? (
                   <div className="h-full bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between group hover:bg-white transition-all duration-500">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                               <Quote className="h-4 w-4 rotate-180" />
                            </div>
                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Client Feedback</span>
                         </div>
                         <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="text-sm font-black text-amber-800">{typeof order.rating === 'object' ? order.rating.score.toFixed(1) : Number(order.rating).toFixed(1)}</span>
                         </div>
                      </div>

                      <div className="mt-4 relative">
                         <p className="text-sm font-medium text-slate-600 leading-relaxed italic pr-8">
                           {typeof order.rating === 'object' ? order.rating.comment : 'No detailed feedback provided.'}
                         </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100/50">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Customer satisfaction</span>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center gap-2">
                      <Star className="h-8 w-8 text-slate-200" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
                        <p className="text-[9px] text-slate-300 font-bold">Feedback will appear after customer checkout</p>
                      </div>
                   </div>
                 )}
              </div>
           </div>

           {/* Tech Note & Custom Instructions */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-2">
              {order.notes && (
                 <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/30 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-[#4988c4] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-[#4988c4] uppercase tracking-widest block">Customer Instruction</span>
                       <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{order.notes}"</p>
                    </div>
                 </div>
              )}
              {task?.staffNote && (
                 <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Staff Execution Log</span>
                       <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{task.staffNote}"</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Gallery Dialog Viewer */}
      <Dialog open={!!viewerData} onOpenChange={(open) => !open && setViewerData(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white rounded-3xl shadow-2xl">
          <DialogHeader className="hidden">
            <DialogTitle>Gallery View</DialogTitle>
          </DialogHeader>

          <div className="relative w-full aspect-square sm:aspect-video flex flex-col items-center justify-center bg-slate-50">
            {viewerData && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Navigation: Prev */}
                {viewerData.images.length > 1 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 z-50 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white/50 hover:bg-white rounded-full shadow-sm transition-all active:scale-95"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={viewerData.images[viewerData.index]}
                    alt="Evidence gallery"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  />
                </div>

                {/* Navigation: Next */}
                {viewerData.images.length > 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 z-50 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-white/50 hover:bg-white rounded-full shadow-sm transition-all active:scale-95"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Indicator Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white shadow-sm border border-slate-100 px-3 py-1 rounded-full">
                  {viewerData.index + 1} / {viewerData.images.length}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
