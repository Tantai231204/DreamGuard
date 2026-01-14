// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

import { ApiErrorCode } from "./constants";
import { ApiError } from "./axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache 5 phút
      staleTime: 5 * 60 * 1000,

      // Giữ cache 30 phút
      gcTime: 30 * 60 * 1000,

      // Không refetch khi focus
      refetchOnWindowFocus: false,

      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (
            error.code === ApiErrorCode.UNAUTHORIZED ||
            error.code === ApiErrorCode.FORBIDDEN ||
            error.code === ApiErrorCode.VALIDATION
          ) {
            return false;
          }
        }

        return failureCount < 2;
      },
    },

    mutations: {
      retry: false,
    },
  },
});
