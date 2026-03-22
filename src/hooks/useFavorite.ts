import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getFavoriteProducts,
  addFavoriteProduct,
  deleteFavoriteProduct,
} from "../api/services/favoriteService"

import { useAuthStore } from "../store/authStore"

export const useFavoriteProducts = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ["favorite-products"],
    queryFn: getFavoriteProducts,
    enabled: isAuthenticated,
  })
}

import type { FavoriteListResponse, FavoriteProduct } from "../api/services/favoriteService"

export const useAddFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addFavoriteProduct,
    onMutate: async (productId: string) => {
      // 1. Cancel actions
      await queryClient.cancelQueries({ queryKey: ["favorite-products"] })

      // 2. Snapshot
      const previousResponse = queryClient.getQueryData<FavoriteListResponse>(["favorite-products"])

      // 3. Optimistic Update
      queryClient.setQueryData<FavoriteListResponse>(["favorite-products"], (old) => {
        if (!old) return old;
        const tempItem: FavoriteProduct = {
          id: `temp-${Date.now()}`,
          productId: productId,
          productName: "...", // Placeholder
          slug: "",
          basePrice: 0,
          salePrice: 0,
          averageRating: 0,
          status: "Active",
          imageUrls: [],
          createdAt: new Date().toISOString(),
        }
        return {
          ...old,
          items: [...old.items, tempItem],
          totalCount: (old.totalCount || 0) + 1,
        }
      })

      return { previousResponse }
    },
    onSuccess: () => {
      toast.success("Added to wishlist")
    },
    onError: (error: unknown, _productId, context) => {
      queryClient.setQueryData(["favorite-products"], context?.previousResponse)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to add to wishlist, please login first")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] })
    },
  })
}

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFavoriteProduct,
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-products"] })

      const previousResponse = queryClient.getQueryData<FavoriteListResponse>(["favorite-products"])

      queryClient.setQueryData<FavoriteListResponse>(["favorite-products"], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.productId !== productId),
          totalCount: Math.max(0, (old.totalCount || 0) - 1),
        }
      })

      return { previousResponse }
    },
    onSuccess: () => {
      toast.success("Removed from wishlist")
    },
    onError: (error: unknown, _productId, context) => {
      queryClient.setQueryData(["favorite-products"], context?.previousResponse)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to remove from wishlist")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] })
    },
  })
}
