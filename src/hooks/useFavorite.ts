import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getFavoriteProducts,
  addFavoriteProduct,
  deleteFavoriteProduct,
} from "../api/services/favoriteService"

export const useFavoriteProducts = () => {
  return useQuery({
    queryKey: ["favorite-products"],
    queryFn: getFavoriteProducts,
  })
}

export const useAddFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addFavoriteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] })
      toast.success("Added to wishlist")
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to add to wishlist")
    }
  })
}

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFavoriteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] })
      toast.success("Removed from wishlist")
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Failed to remove from wishlist")
    }
  })
}