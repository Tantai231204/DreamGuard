import apiClient from '../../lib/api';
import type { StaffResponse, CreateStaffRequest, UpdateStaffRequest, StaffPageResponse, StaffParams, UpdateStaffAccountRequest } from '../types/staff.types';

const staffService = {
  getAllStaff: async (params: StaffParams = {}): Promise<StaffPageResponse> => {
    const response = await apiClient.get('/staffs/GetAllAsync', { params });
    // Keep data as returned from paginated endpoint directly
    return response.data?.data ?? response.data;
  },

  getStaffById: async (id: string): Promise<StaffResponse> => {
    const response = await apiClient.get(`/staffs/${id}`);
    return response.data?.data ?? response.data;
  },

  createStaff: async (data: CreateStaffRequest): Promise<StaffResponse> => {
    // Note: User's image shows the POST is sent to /api/auths/createstaff
    const response = await apiClient.post('/auths/createstaff', data);
    return response.data?.data ?? response.data;
  },

  updateStaff: async (id: string, data: UpdateStaffRequest): Promise<StaffResponse> => {
    const response = await apiClient.put(`/staffs/${id}`, data);
    return response.data?.data ?? response.data;
  },

  updateStaffRole: async (id: string, newRole: string): Promise<void> => {
    // PUT /api/staffs/{id}/UpdateRole?newRole=Manager
    const response = await apiClient.put(`/staffs/${id}/UpdateRole?newRole=${encodeURIComponent(newRole)}`);
    return response.data;
  },

  getStaffProfile: async (): Promise<StaffResponse> => {
    const response = await apiClient.get('/staffs');
    return response.data?.data ?? response.data;
  },

  updateStaffAccount: async (id: string, data: UpdateStaffAccountRequest): Promise<void> => {
    const response = await apiClient.put(`/staffs/${id}/UpdateAccount`, data);
    return response.data;
  },

  getCleaningStaffsForAssignment: async (): Promise<StaffResponse[]> => {
    const response = await apiClient.get('/staffs/GetCleaningStaffsForAssignment');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  getDeliveryStaffsForAssignment: async (): Promise<StaffResponse[]> => {
    const response = await apiClient.get('/staffs/GetDeliveryStaffsForAssignment');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : (data?.items || []);
  },
};

export default staffService;
