import api from "../../lib/api"

export interface FavoriteProduct {
  id: string
  name: string
  price: number
  image: string
}

export interface FavoriteListResponse {
  items: FavoriteProduct[]
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const getFavoriteProducts = async () => {
  const res = await api.get<FavoriteListResponse>("/favoriteproduct")
  return res.data
}

export const addFavoriteProduct = async (productId: string) => {
  const res = await api.post(`/favoriteproduct/${productId}`)
  return res.data
}

export const deleteFavoriteProduct = async (productId: string) => {
  const res = await api.delete(`/favoriteproduct/${productId}`)
  return res.data
}