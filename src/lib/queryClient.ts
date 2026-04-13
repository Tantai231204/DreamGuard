import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { ApiError, ERROR_TITLES } from "./api";
import { ApiErrorCode } from "./constants";

// Centralized Toast Deduplication to prevent multiple identical alerts simultaneously
let lastQueryToastTime = 0;
let lastQueryToastMessage = "";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // Reduced gcTime
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,

      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403 || status === 400 || status === 404 || status === 409) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Skip if marked as hidden
      if (query.meta?.hideToast) return;

      const apiError = error as ApiError;
      const title = ERROR_TITLES[apiError.code] || "Error";
      
      // Implement Deduplication for GET queries (Parallel API floods)
      const now = Date.now();
      if (now - lastQueryToastTime < 1500 && lastQueryToastMessage === apiError.message) {
        return; 
      }
      lastQueryToastTime = now;
      lastQueryToastMessage = apiError.message;

      // Special 401 handling
      if (apiError.code === ApiErrorCode.UNAUTHORIZED) {
        toast.error("Session Expired", {
            description: "Please log in again to continue."
        });
        return;
      }

      toast.error(title, {
        description: apiError.message,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Skip if explicitly hidden in mutation meta
      if (mutation.meta?.hideToast) return;

      const apiError = error as ApiError;
      const title = ERROR_TITLES[apiError.code] || "Action Failed";

      toast.error(title, {
        description: apiError.message,
      });
    },
  }),
});