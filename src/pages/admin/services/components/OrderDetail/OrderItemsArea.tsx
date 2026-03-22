import { FileText, Hourglass, CheckCircle, Camera, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { ExtendedServiceItemDetail, TaskDetail, ServicePackageMappingResponse } from './types';

interface OrderItemsAreaProps {
  orderItems: ExtendedServiceItemDetail[];
  mappingQueries: { data?: ServicePackageMappingResponse }[];
  task?: TaskDetail;
}

export function OrderItemsArea({ orderItems, mappingQueries, task }: OrderItemsAreaProps) {
  return (
    <div className="space-y-8">
      {/* Order Items List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-500" /> Service Packages Detailed
        </h3>
        <Separator className="bg-slate-100" />

        <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Package Name</th>
                <th className="px-5 py-3 text-center">Qty</th>
                <th className="px-5 py-3 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {orderItems.length > 0 ? (
                orderItems.map((item: ExtendedServiceItemDetail, idx: number) => {
                  const mappingQuery = mappingQueries[idx];
                  const details = mappingQuery?.data;
                  const imageUrl = details?.servicePackage?.imageUrl;
                  const benefits = details?.servicePackage?.benefits?.split('\r\n') || [];

                  return (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-4">
                          {imageUrl ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                              <img src={imageUrl} alt={item.servicePackageName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <FileText className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-slate-800 text-sm">{item.servicePackageName || item.name || 'Service Item'}</span>
                            {item.productTypeName && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100/50 w-fit">
                                Fits: {item.productTypeName}
                              </span>
                            )}
                            {details?.duration && (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Hourglass className="h-3 w-3" /> Dur: {details.duration} mins
                              </span>
                            )}
                            {benefits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {benefits.map((b: string, i: number) => (
                                  <span key={i} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle className="h-2.5 w-2.5 text-emerald-500" /> {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge className="bg-slate-100 text-slate-700 border-0 font-bold px-2 rounded-md">
                          {item.quantity || 1}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-800 tabular-nums">
                        {formatPrice(item.totalPrice || item.unitPrice || item.price || details?.price || 0)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-slate-400 italic bg-slate-50/50">
                    No packages items breakdown provided
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In / Check-Out Validation section */}
      {task && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-sky-500" /> Check-In Validation
            </h3>
            <Separator className="bg-slate-100" />
            {task.checkIn || task.checkinImage || task.checkinUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100 mt-2">
                <img
                  src={task.checkIn || task.checkinImage || task.checkinUrl || undefined}
                  className="object-cover w-full h-full"
                  alt="Check-In"
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <Camera className="h-6 w-6 mb-1 text-slate-300" />
                <span className="text-xs font-bold">No Image Reported</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Check-Out Validation
            </h3>
            <Separator className="bg-slate-100" />
            {task.checkOut || task.checkoutImage || task.checkoutUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100 mt-2">
                <img
                  src={task.checkOut || task.checkoutImage || task.checkoutUrl || undefined}
                  className="object-cover w-full h-full"
                  alt="Check-Out"
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="h-6 w-6 mb-1 text-slate-300" />
                <span className="text-xs font-bold">No Image Reported</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
