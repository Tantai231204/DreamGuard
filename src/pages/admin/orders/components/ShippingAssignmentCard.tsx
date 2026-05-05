import { motion } from "framer-motion";
import { User, Phone, ShieldCheck, Truck } from "lucide-react";
import { useStaffs } from "@/hooks/queries/useStaff";
import { useShippingTasksByOrder } from "@/hooks/queries/useShippingTask";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminStatusBadge } from "@/components/admin";

interface ShippingAssignmentCardProps {
    orderId: string;
    onOpenAssign: () => void;
    canAssign: boolean;
    delay?: number;
}

import { useAuthStore } from '@/store/authStore';
import { isAdminOrManager as checkIsAdminOrManager } from '@/lib/role';

export function ShippingAssignmentCard({ orderId, onOpenAssign, canAssign, delay = 0 }: ShippingAssignmentCardProps) {
        const role = useAuthStore((s) => s.role);
        const isAdminOrManager = checkIsAdminOrManager(role);
        const { data: staffsResponse } = useStaffs(
            isAdminOrManager ? { pageSize: 100, Role: "DeliveryStaff" } : undefined,
            { enabled: isAdminOrManager }
        );
        const { data: tasks } = useShippingTasksByOrder(orderId);

        const activeTask = tasks?.find(t => t.status !== "Reassigned");
        const taskStatus = activeTask?.status?.toLowerCase();
        const isTaskPending = !activeTask || 
                             taskStatus === "pending" || 
                             taskStatus === "waiting_for_staff" || 
                             taskStatus === "waitingforstaff" || 
                             taskStatus === "0";

        // For sellers, reconstruct minimal staff info from task
        let currentStaff = null;
        if (isAdminOrManager) {
            currentStaff = staffsResponse?.items.find(s => s.staffId === activeTask?.staffId);
        } else if (activeTask?.staffId) {
            currentStaff = {
                staffId: activeTask.staffId,
                fullName: activeTask.staffName,
                // No avatar/phone/role info available for sellers
            };
        }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-500" /> Shipping Assigned
                </h3>
                <Separator className="bg-slate-100" />
                {currentStaff ? (
                    <div className="space-y-4">
                        <div
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${canAssign && isAdminOrManager && isTaskPending ? 'bg-slate-50 border-slate-100/80 cursor-pointer hover:bg-slate-100/60' : 'bg-slate-50 border-slate-100/40 cursor-default'}`}
                            onClick={canAssign && isAdminOrManager && isTaskPending ? onOpenAssign : undefined}
                            title={canAssign && isAdminOrManager ? (isTaskPending ? "Click to Reassign" : `Task is ${activeTask?.status} and cannot be reassigned`) : "Assigned personnel"}
                        >
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                <AvatarImage src={currentStaff.avatarUrl} />
                                <AvatarFallback className="bg-blue-600 text-white font-black text-base">
                                    {currentStaff.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-black text-slate-800 text-sm truncate">{currentStaff.fullName}</p>
                                    <div className="flex items-center gap-2">
                                        {activeTask && <AdminStatusBadge status={activeTask.status} />}
                                        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {currentStaff.phoneNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {activeTask?.staffNote && (() => {
                            const parts = activeTask.staffNote.split(" | Manager Note: ");
                            const staffPart = parts[0]?.trim();
                            const managerPart = parts[1]?.trim();

                            return (
                                <div className="space-y-2">
                                    {staffPart && (
                                        <div className="px-3 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl">
                                            <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest mb-1">Staff Note</p>
                                            <p className="text-sm text-amber-900/80 leading-relaxed">"{staffPart}"</p>
                                        </div>
                                    )}
                                    {managerPart && (
                                        <div className="px-3 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl">
                                            <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-widest mb-1">Manager Note</p>
                                            <p className="text-sm text-blue-900/80 leading-relaxed">"{managerPart}"</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div
                        className={`w-full h-full flex flex-col items-center justify-center py-10 rounded-xl border-[1.5px] border-dashed text-center transition-all duration-300 ${canAssign && isAdminOrManager && isTaskPending
                            ? "bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 group cursor-pointer"
                            : "bg-slate-50/30 border-slate-100 cursor-default"
                            }`}
                        onClick={canAssign && isAdminOrManager && isTaskPending ? onOpenAssign : undefined}
                        title={!isAdminOrManager ? "Awaiting staff assignment" : !canAssign ? "Order must be Confirmed to assign delivery personnel." : isTaskPending ? "Assign Delivery Personnel" : `Task is ${activeTask?.status} and cannot be modified`}
                    >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 transition-colors ${canAssign && isAdminOrManager ? "bg-slate-100 group-hover:bg-slate-200/50" : "bg-slate-100"}`}>
                            <User className={`h-4 w-4 transition-colors ${canAssign && isAdminOrManager ? "text-slate-400 group-hover:text-slate-500" : "text-slate-300"}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${canAssign && isAdminOrManager ? "text-slate-400 group-hover:text-slate-500" : "text-slate-300"}`}>
                            {!isAdminOrManager ? "Unassigned" : canAssign ? "Assign Technician" : "Awaiting Confirmation"}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
