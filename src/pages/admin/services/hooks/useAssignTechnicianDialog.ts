import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStaffs } from '@/hooks/queries/useStaff';
import api from '@/lib/api';
import serviceOrderService from '@/api/services/serviceOrderService';

interface UseAssignTechnicianDialogProps {
  orderId: string | null;
  isRescheduled?: boolean;
  onClose: () => void;
}

export const useAssignTechnicianDialog = ({ orderId, isRescheduled, onClose }: UseAssignTechnicianDialogProps) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: staffData, isLoading: isLoadingStaff } = useStaffs({ 
    pageSize: 100, 
    Role: "CleaningStaff" 
  });
  const staffs = staffData?.items || [];

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!orderId || !selectedStaffId) throw new Error('Missing data');
      
      if (isRescheduled) {
        return await serviceOrderService.reassignStaffForRescheduled({
          serviceOrderId: orderId,
          newStaffId: selectedStaffId
        });
      }

      const res = await api.post('/ServiceTasks', {
        soId: orderId,
        staffId: selectedStaffId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Technician assigned successfully');
      // Force refetch to update calendar immediately
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', orderId] });
        queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', orderId] });
        queryClient.invalidateQueries({ queryKey: ['serviceTasks', 'list', orderId] });
        queryClient.invalidateQueries({ queryKey: ['serviceEvidences', orderId] });
      }
      onClose();
      setSelectedStaffId('');
    },
    onError: (err: unknown) => {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (errorMessage.includes('Service task already exists')) {
        toast.error('This order already has a technician assigned.');
        // Force refresh to sync UI
        queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
        if (orderId) {
          queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', orderId] });
          queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', orderId] });
        }
        onClose();
      } else {
        toast.error('Failed to assign technician');
      }
    },
  });

  const handleAssign = () => {
    if (!selectedStaffId) {
      toast.error('Please select a technician first');
      return;
    }
    assignMutation.mutate();
  };

  return {
    selectedStaffId,
    setSelectedStaffId,
    staffs,
    isLoadingStaff,
    handleAssign,
    assignMutation,
  };
};
