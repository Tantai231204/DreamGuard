import api from "../../lib/api"

export interface FavoriteProduct {
  id: string
  productId?: string
  productName?: string
  comboId?: string        // Added comboId support
  comboName?: string      // Added comboName support
  slug: string
  basePrice: number
  salePrice: number
  averageRating: number
  status: string
  imageUrls: string[]
  createdAt: string
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

// Added Combo favorite methods
export const addFavoriteCombo = async (comboId: string) => {
  const res = await api.post(`/favoriteproduct/combo/${comboId}`)
  return res.data
}

export const deleteFavoriteCombo = async (comboId: string) => {
  const res = await api.delete(`/favoriteproduct/combo/${comboId}`)
  return res.data
}