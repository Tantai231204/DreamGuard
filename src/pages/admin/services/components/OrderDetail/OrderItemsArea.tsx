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
} from 'lucide-react';
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
import type { ExtendedServiceItemDetail, TaskDetail, ServicePackageMappingResponse } from './types';

interface OrderItemsAreaProps {
  orderItems: ExtendedServiceItemDetail[];
  mappingQueries: UseQueryResult<ServicePackageMappingResponse, Error>[];
  task?: TaskDetail;
  customerAssets?: string[];
}

export const OrderItemsArea = memo(function OrderItemsArea({ 
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" /> PROFESSIONAL SERVICE PACKAGES
          </h3>
          <Badge variant="secondary" className="text-[10px] font-bold text-blue-600 bg-blue-50 border-none rounded-full h-6 px-3">
            {orderItems.length} {orderItems.length > 1 ? 'Services' : 'Service'} Selected
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
                    <p className="text-sm font-black text-blue-600 tabular-nums shrink-0 uppercase tracking-tighter">
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

      {/* REFERENCE ASSETS */}
      {customerAssets && customerAssets.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-sky-500" /> REFERENCE ASSETS
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 rounded-full h-6 px-3">
              {customerAssets.length} Documents
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            {customerAssets.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setViewerData({ images: customerAssets, index: idx })}
                className="relative group w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all"
              >
                <img
                  src={url}
                  alt={`c-asset-${idx}`}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VALIDATION EVIDENCE */}
      {task && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" /> VALIDATION EVIDENCE
            </h3>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px]">
                Completed {task.checkOut || 'N/A'}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Performance & Result Proof</span>
            <div className="flex flex-wrap gap-3">
              {/* Check-In/Out Thumbnails */}
              {[
                { url: task.checkInImage || task.checkinImage || task.checkinUrl || task.checkInUrl, label: 'Entry' },
                { url: task.checkOutImage || task.checkoutImage || task.checkoutUrl || task.checkOutUrl, label: 'Exit' }
              ].map((img, i) => img.url && (
                <div
                  key={`fixed-${i}`}
                  onClick={() => setViewerData({ images: evidenceImages, index: i })}
                  className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all"
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] font-black text-slate-600 uppercase">{img.label}</span>
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
                  className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in transition-all"
                >
                  <img src={ev.imageUrl || ev.imageURL || ev.url || ev.photoUrl || ""} alt="ev" className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                    <Maximize2 className="h-3 w-3 text-slate-600" />
                    <span className="text-[7px] text-slate-500 font-bold uppercase truncate w-full text-center px-1">{ev.evidenceType || 'Detail'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {task.staffNote && (
            <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50 flex flex-col gap-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none">
                <Briefcase className="h-3.5 w-3.5" /> Technician's Log
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{task.staffNote}"
              </p>
            </div>
          )}
        </div>
      )}

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
