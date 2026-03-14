import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getFavoriteProducts,
  deleteFavoriteProduct,
} from "../api/services/favoriteService"

export const useFavoriteProducts = () => {
  return useQuery({
    queryKey: ["favorite-products"],
    queryFn: getFavoriteProducts,
  })
}

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFavoriteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-products"] })
    },
  })
}