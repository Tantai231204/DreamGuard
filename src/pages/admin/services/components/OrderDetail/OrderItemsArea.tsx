import {
  Camera, CheckCircle2,
  Clock, Briefcase, BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ExtendedServiceItemDetail, TaskDetail, ServicePackageMappingResponse } from './types';

interface OrderItemsAreaProps {
  orderItems: ExtendedServiceItemDetail[];
  mappingQueries: UseQueryResult<ServicePackageMappingResponse, Error>[];
  task?: TaskDetail;
}

export function OrderItemsArea({ orderItems, mappingQueries, task }: OrderItemsAreaProps) {
  return (
    <div className="space-y-8">
      {/* Professional Service Packages */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" /> Professional Service Packages
        </h3>
        <Separator className="bg-slate-50" />

        <div className="flex flex-col gap-4">
          {orderItems.map((item, index) => {
            const mappingData = mappingQueries[index]?.data;
            const isLoadingMapping = mappingQueries[index]?.isLoading;

            return (
              <div key={item.servicePackageMappingId} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 transition-all group hover:shadow-md">
                <div className="relative h-24 w-36 rounded-xl overflow-hidden shadow-inner border border-slate-200 flex-shrink-0 bg-white">
                  {mappingData?.servicePackage?.imageUrl ? (
                    <img src={mappingData.servicePackage.imageUrl} alt="Package" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50/30">
                      <BookOpen className="h-8 w-8 text-blue-200" />
                    </div>
                  )}
                  <div className="absolute top-1.5 right-1.5">
                    <Badge className="bg-blue-600 text-white border-none font-black text-[10px] px-2 h-5 shadow-lg">
                      {item.quantity || 1}x
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-2 py-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-900">
                        {mappingData?.servicePackage?.packageName || item.servicePackageName || (isLoadingMapping ? 'Fetching...' : 'Standard Package')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase tracking-wider h-4 px-1.5">
                          {mappingData?.productType?.productTypeName || item.productTypeName}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {mappingData?.duration || mappingData?.servicePackage?.duration || '--'} mins
                        </span>
                      </div>
                    </div>
                    <p className="text-base font-black text-blue-600 tabular-nums">
                      {formatPrice(mappingData?.price ?? item.unitPrice ?? 0)}
                    </p>
                  </div>

                  {/* Package Benefits/Tasks */}
                  <div className="bg-slate-100/30 p-2 rounded-xl border border-slate-200/50">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {(mappingData?.servicePackage?.benefits?.split('\r\n') || []).slice(0, 3).map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {benefit}
                        </div>
                      ))}
                      {(!mappingData?.servicePackage?.benefits && mappingData?.servicePackage?.serviceContent) && (
                        <div className="text-[10px] text-slate-500 font-medium italic line-clamp-2">
                          {mappingData.servicePackage.serviceContent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Validation Evidence */}
      {task && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" /> Validation Evidence
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200">
              Visual Proof of Completion
            </Badge>
          </div>
          <Separator className="bg-slate-50" />

          {/* Check-In/Out Evidence Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Check-In Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Entry Check-In</span>
                {task.checkIn && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-bold text-[10px] flex items-center gap-1 px-2 py-0.5">
                    <Clock className="h-3 w-3" /> {task.checkIn}
                  </Badge>
                )}
              </div>

              <div className="relative group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border-4 border-slate-50 ring-1 ring-slate-100 bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg">
                  {task.checkInImage || task.checkinImage || task.checkinUrl || task.checkInUrl ? (
                    <img src={task.checkInImage || task.checkinImage || task.checkinUrl || task.checkInUrl || ""} alt="Check-In" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-30 grayscale group-hover:opacity-50 transition-opacity">
                      <Camera className="h-10 w-10 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest italic">No entry proof</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Check-Out Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Exit Check-Out</span>
                {task.checkOut && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-[10px] flex items-center gap-1 px-2 py-0.5">
                    <CheckCircle2 className="h-3 w-3" /> {task.checkOut}
                  </Badge>
                )}
              </div>

              <div className="relative group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border-4 border-slate-50 ring-1 ring-slate-100 bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg">
                  {task.checkOutImage || task.checkoutImage || task.checkoutUrl || task.checkOutUrl ? (
                    <img src={task.checkOutImage || task.checkoutImage || task.checkoutUrl || task.checkOutUrl || ""} alt="Check-Out" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-30 grayscale group-hover:opacity-50 transition-opacity">
                      <CheckCircle2 className="h-10 w-10 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest italic">No exit proof</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New: Extended Evidence Gallery */}
          {task.evidences && task.evidences.length > 0 && (
            <>
              <Separator className="bg-slate-50" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Additional Progress Evidence ({task.evidences.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {task.evidences.map((ev, idx) => (
                    <div key={ev.seId || idx} className="space-y-2 group/ev">
                      <div className="aspect-square rounded-2xl overflow-hidden shadow-sm border-2 border-slate-50 ring-1 ring-slate-100 bg-slate-50 relative">
                        <img src={ev.imageUrl || ev.imageURL || ev.url || ev.photoUrl || ""} alt={ev.description} className="w-full h-full object-cover transition-transform duration-500 group-hover/ev:scale-110" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/ev:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center backdrop-blur-[2px]">
                          <Camera className="h-4 w-4 text-white/80 mb-1.5" />
                          <p className="text-[9px] text-white font-bold leading-tight">{ev.description || 'Service detail'}</p>
                        </div>
                      </div>
                      <div className="px-1 flex items-center justify-between gap-2">
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1 rounded truncate">
                          {ev.evidenceType || 'Progress'}
                        </span>
                        <span className="text-[8px] font-medium text-slate-300 truncate">
                          {new Date(ev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {task.staffNote && (
            <>
              <Separator className="bg-slate-100" />
              <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">
                  <Briefcase className="h-3.5 w-3.5" /> Technician's Observations & Notes
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{task.staffNote}"
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
