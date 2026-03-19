import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, Heart, ShieldAlert, Lock, RefreshCw } from 'lucide-react';

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: User | null;
}

export function CustomerDetailDialog({ open, onOpenChange, customer }: CustomerDetailDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-2 border-slate-100">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            Customer Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-6">
          <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-md">
            <AvatarImage src={customer.avatarUrl} />
            <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
              {customer.fullName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{customer.fullName}</h3>
            <p className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
              ID: {customer.customerId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/80 mt-1">
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Total Orders</span>
              <p className="text-lg font-bold text-slate-800">12</p>
            </div>
            <div className="text-center border-l border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Total Spent</span>
              <p className="text-lg font-bold text-blue-600">4.500.000đ</p>
            </div>
          </div>

          <div className="w-full space-y-3 mt-1 border-t pt-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Mail className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email</span>
                <span className="text-sm font-medium text-slate-700">{customer.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Phone className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Phone</span>
                <span className="text-sm font-medium text-slate-700">{customer.phoneNumber || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Heart className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Gender</span>
                <span className="text-sm font-medium text-slate-700">{customer.gender || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Birthdate</span>
                <span className="text-sm font-medium text-slate-700">
                  {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 font-semibold shadow-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
            Reset PW
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-red-200 font-semibold shadow-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all">
            <Lock className="h-3.5 w-3.5" />
            Suspend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
