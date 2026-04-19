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
  Image as ImageIcon,
  CheckCircle2,
  Camera,
  Briefcase,
  AlertCircle,
  Star,
  CreditCard,
  FileCheck
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

  // Optimized Evidence Image Collection & Normalization
  const { allEvidenceImages, displayableEvidences } = useMemo(() => {
    const images: string[] = [];
    const thumbs: { url: string; label: string; index: number }[] = [];

    const checkIn = task?.checkInImage || task?.checkinImage || task?.checkinUrl || task?.checkInUrl;
    if (checkIn) {
      thumbs.push({ url: checkIn, label: 'ENTRY', index: images.length });
      images.push(checkIn);
    }

    const checkOut = task?.checkOutImage || task?.checkoutImage || task?.checkoutUrl || task?.checkOutUrl;
    if (checkOut) {
      thumbs.push({ url: checkOut, label: 'EXIT', index: images.length });
      images.push(checkOut);
    }

    (task?.evidences || []).forEach((ev) => {
      const url = ev.imageUrl || ev.imageURL || ev.url || ev.photoUrl;
      if (url) {
        thumbs.push({ url, label: 'GALLERY', index: images.length });
        images.push(url);
      }
    });

    return { allEvidenceImages: images, displayableEvidences: thumbs };
  }, [task]);

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
      {/* PROFESSIONAL SERVICE PACKAGES omitted for brevity in instruction, keeping same structure */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100/50 shadow-sm">
              <Briefcase className="h-5 w-5 text-[#4988c4]" />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-[#4988c4] uppercase tracking-[0.2em] leading-none mb-1">
                Resource Allocation
              </h3>
              <p className="text-base font-black text-slate-900 tracking-tight">Professional Service Packages</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] font-black text-slate-500 bg-slate-50 border-slate-200/60 border rounded-full h-7 px-4">
            {orderItems.length} {orderItems.length > 1 ? 'ITEMS' : 'ITEM'}
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {(displayedItems as ExtendedServiceItemDetail[]).map((item: ExtendedServiceItemDetail, index) => {
            const mappingData = mappingQueries[index]?.data;
            const isLoadingMapping = mappingQueries[index]?.isLoading;

            // Smarter Benefits Splitting (handles comma, semicolon, newline, and quotes)
            const rawBenefits = mappingData?.servicePackage?.benefits || '';
            const benefits = rawBenefits
              .split(/[\n\r,;\u2022]+/)
              .map(b => b.trim().replace(/^["']|["']$/g, ''))
              .filter(b => b.length > 0);

            return (
              <div key={item.servicePackageMappingId || index} className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-slate-50/30 rounded-[2rem] border border-slate-100 hover:bg-white hover:border-[#4988c4]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                {/* Visual Section */}
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white border border-slate-100 flex-shrink-0 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md">
                  {mappingData?.servicePackage?.imageUrl ? (
                    <img src={mappingData.servicePackage.imageUrl} alt="Package" className="w-full h-full object-contain p-2 mix-blend-multiply transition-all" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <Briefcase className="h-10 w-10 text-slate-200" />
                    </div>
                  )}
                  {/* Quantity Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#4988c4] text-white font-black text-[10px] shadow-lg shadow-blue-500/20 ring-2 ring-white z-10 transition-transform group-hover:scale-110">
                    {item.quantity || 1}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">
                          {mappingData?.servicePackage?.packageName || item.servicePackageName || (isLoadingMapping ? 'Syncing...' : 'Premium Package')}
                        </h4>
                        <Badge variant="secondary" className="bg-white text-slate-500 border-slate-100 border text-[8px] font-black uppercase tracking-widest h-5 px-2 rounded-lg shadow-sm">
                          {mappingData?.productType?.productTypeName || item.productTypeName || 'Service'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-[#4988c4]" />
                          <span className="text-slate-600">{mappingData?.duration || mappingData?.servicePackage?.duration || '60'} Minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Unit Price</span>
                      <div className="text-xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                        {formatPrice(mappingData?.price ?? item.unitPrice ?? 0)}
                      </div>
                    </div>
                  </div>

                  {/* Benefits Grid */}
                  {benefits.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 pt-4 border-t border-slate-100/60">
                      {benefits.slice(0, 9).map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 group/item">
                          <div className="mt-0.5 flex-shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 bg-emerald-50 rounded-full p-0.5" />
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 leading-snug line-clamp-2 group-hover/item:text-slate-900 transition-colors">
                            {benefit}
                          </p>
                        </div>
                      ))}
                      {benefits.length > 9 && (
                        <p className="text-[9px] font-black text-[#4988c4] uppercase tracking-widest pt-1 cursor-help hover:underline">
                          + {benefits.length - 9} Additional details
                        </p>
                      )}
                    </div>
                  )}
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
            className="w-full h-12 rounded-[1.5rem] bg-slate-50/50 text-slate-500 hover:bg-white hover:text-[#4988c4] hover:shadow-md hover:border-[#4988c4]/30 font-black uppercase text-[10px] tracking-widest gap-2 transition-all border border-dashed border-slate-200"
          >
            {showAllPackages ? (
              <> <ChevronUp className="h-4 w-4" /> COMPRESS RESOURCE LIST </>
            ) : (
              <> <ChevronDown className="h-4 w-4" /> EXPAND {remainingPackagesCount} ADDITIONAL PACKAGES </>
            )}
            </Button>
          )}
        </div>

        {/* MEDIA DOSSIER - Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* REFERENCE ASSETS (Before/Context) */}
          {customerAssets && customerAssets.length > 0 && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 h-full transition-all hover:shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Source Documentation</h3>
                    <p className="text-sm font-black text-slate-900 uppercase">Reference Assets</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100 rounded-full h-6 px-3 uppercase tracking-tighter">
                  {customerAssets.length} FILES
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
              {customerAssets.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setViewerData({ images: customerAssets, index: idx })}
                  className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <img src={url} alt={`c-asset-${idx}`} className="w-full h-full object-cover transition-all group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-[#4988c4]/0 group-hover:bg-[#4988c4]/10 transition-colors flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VALIDATION EVIDENCE (After/Results) */}
        {task && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 h-full transition-all hover:shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50 shadow-sm">
                  <Camera className="h-5 w-5 text-[#4988c4]" />
                </div>
                <div>
                  <h3 className="text-[9px] font-black text-[#4988c4] uppercase tracking-[0.2em] leading-none mb-1">Execution Evidence</h3>
                  <p className="text-sm font-black text-slate-900 uppercase">Validation Proofs</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 border font-black text-[9px] h-6 px-3 rounded-full uppercase">
                {allEvidenceImages.length} EVIDENCE
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {displayableEvidences.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => setViewerData({ images: allEvidenceImages, index: ev.index })}
                    className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <img src={ev.url} alt={ev.label} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                    {ev.label !== 'GALLERY' && (
                      <div className="absolute top-1.5 right-1.5 p-1">
                        <div className="bg-black/60 backdrop-blur-md text-white rounded-md h-4 px-2 flex items-center justify-center font-black text-[7px] uppercase tracking-widest shadow-lg border border-white/20">
                          {ev.label}
                        </div>
                      </div>
                    )}
                    {ev.label === 'GALLERY' && (
                      <div className="absolute inset-0 bg-[#4988c4]/0 group-hover:bg-[#4988c4]/10 transition-colors flex flex-col items-center justify-center p-1">
                        <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SETTLEMENT & FINAL OUTCOME */}
      <div className="pt-2">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden transition-all hover:shadow-lg">
          {/* Decorative Context */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#4988c4] to-blue-700 flex items-center justify-center border border-blue-400/20 shadow-xl shadow-blue-500/10">
                <FileCheck className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <h3 className="text-[9px] font-black text-[#4988c4] uppercase tracking-[0.3em] leading-none mb-1.5">Financial Analysis</h3>
                <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Settlement Dossier</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-slate-100 h-6 px-3 rounded-full bg-slate-50/50 mb-1">Authenticated</Badge>
              <span className="text-[7px] font-black text-slate-300 italic tracking-tight">UUID: {order.orderCode || order.id || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Financial Metrics */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">Net Settlement Revenue</span>
                <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{formatPrice(order.totalPrice || 0)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Payment Origin</span>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                    {String(order.paymentMethod || '').toLowerCase().includes('vnpay') ? (
                      <img src={`${import.meta.env.BASE_URL}images/vnpay.svg`} alt="vnpay" className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{order.paymentMethod || 'BANK'}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Collection State</span>
                  <AdminStatusBadge status={order.paymentStatus || ''} mode="payment" className="scale-90 origin-left" />
                </div>
              </div>
            </div>

            {/* Interaction Artifacts (Feedback) */}
            <div className="lg:col-span-8">
              {order.rating ? (
                <div className="h-full bg-slate-50/20 rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between group hover:bg-white transition-all duration-500 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/50 shadow-sm">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] leading-none mb-1">
                          Client Audit
                        </h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = order.rating;
                            const score = rating && typeof rating === 'object' ? rating.score : Number(rating || 0);
                            return (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= score ? 'fill-amber-400 text-amber-400 shadow-sm' : 'text-slate-200'}`}
                              />
                            );
                          })}
                          <span className="ml-2 text-[11px] font-black text-slate-900">
                            {(order.rating && typeof order.rating === 'object' ? order.rating.score : Number(order.rating || 0)).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-500/20 rounded-full" />
                    <p className="text-sm font-medium text-slate-600 leading-relaxed tracking-tight pl-2">
                      {typeof order.rating === 'object' ? order.rating.comment : 'No qualitative feedback provided for this session.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Customer Sentiment</span>
                    </div>
                    <div className="h-1 w-12 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(order.rating && typeof order.rating === 'object' ? order.rating.score : Number(order.rating || 0)) * 20}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-slate-50/20 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center gap-4 group hover:bg-slate-50/40 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Star className="h-5 w-5 text-slate-200 group-hover:text-amber-200" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Evaluation Queue</p>
                    <p className="text-[11px] text-slate-300 font-bold max-w-[240px] leading-relaxed">System awaiting client feedback post-settlement finality.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supplemental Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-1">
            {order.notes && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/30 flex items-start gap-3 transition-colors hover:bg-blue-50">
                <AlertCircle className="h-4 w-4 text-[#4988c4] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-[0.15em] block">Customer Directives</span>
                  <p className="text-[11px] font-semibold text-slate-600 leading-tight">"{order.notes}"</p>
                </div>
              </div>
            )}
            {task?.staffNote && (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 transition-colors hover:bg-slate-50">
                <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] block">Execution Context</span>
                  <p className="text-[11px] font-semibold text-slate-500 leading-tight italic">"{task.staffNote}"</p>
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
