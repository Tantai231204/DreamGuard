import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStaffs } from '@/hooks/queries/useStaff';
import api from '@/lib/api';

interface UseAssignTechnicianDialogProps {
  orderId: string | null;
  onClose: () => void;
}

export const useAssignTechnicianDialog = ({ orderId, onClose }: UseAssignTechnicianDialogProps) => {
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
      const res = await api.post('/ServiceTasks', {
        soId: orderId,
        staffId: selectedStaffId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Technician assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      onClose();
      setSelectedStaffId('');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to assign technician');
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
