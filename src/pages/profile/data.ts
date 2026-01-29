import type { BabyProfile, ProductRecommendation, Order, WishlistItem, Address } from "./types"

export const mockBabies: BabyProfile[] = [
    { 
        id: "1", 
        name: "Nguyễn Bảo Ngọc", 
        nickname: "Bé Bông",
        birthDate: "2024-03-15", 
        gender: "female", 
        avatar: "",
        height: 75,
        weight: 9.5,
        notes: "Ngủ xuyên đêm, thích màu hồng",
        allergies: ["Len"]
    },
    { 
        id: "2", 
        name: "Nguyễn Minh Khang", 
        nickname: "Bé Bin",
        birthDate: "2025-08-20", 
        gender: "male", 
        avatar: "",
        height: 55,
        weight: 4.2,
        notes: "Thức đêm 2-3 lần",
        allergies: []
    },
]

export const mockRecommendations: ProductRecommendation[] = [
    {
        id: "1",
        name: "Nệm cao su non cho bé 6-12 tháng",
        price: 1290000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        forAge: "6-12 tháng",
        discount: 15
    },
    {
        id: "2",
        name: "Chăn cotton organic mềm mại",
        price: 590000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        forAge: "0-3 tuổi",
        discount: 10
    },
    {
        id: "3",
        name: "Gối chống trào ngược cho bé sơ sinh",
        price: 450000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        forAge: "0-6 tháng",
    },
]

export const mockOrders: Order[] = [
    {
        id: "DG-2026-001234",
        createdAt: "2026-01-20",
        status: "delivered",
        total: 2450000,
        items: [
            { name: "Bộ chăn ga gối cotton cho bé", quantity: 1, price: 1500000, image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg" },
            { name: "Gối chống trào ngược", quantity: 2, price: 475000, image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg" },
        ],
    },
    {
        id: "DG-2026-001189",
        createdAt: "2026-01-15",
        status: "shipping",
        total: 890000,
        items: [
            { name: "Nệm cao su non cho bé", quantity: 1, price: 890000, image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg" },
        ],
    },
    {
        id: "DG-2026-001150",
        createdAt: "2026-01-10",
        status: "pending",
        total: 1590000,
        items: [
            { name: "Bộ ra trải giường cho bé", quantity: 1, price: 1590000, image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg" },
        ],
    },
]

export const mockWishlist: WishlistItem[] = [
    {
        id: 1,
        name: "Bộ chăn ga gối cotton organic",
        price: 1890000,
        originalPrice: 2200000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        inStock: true,
        discount: 14,
        addedAt: "2026-01-18",
    },
    {
        id: 2,
        name: "Nệm cao su non cho bé sơ sinh",
        price: 890000,
        originalPrice: 1100000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        inStock: true,
        discount: 19,
        addedAt: "2026-01-15",
    },
    {
        id: 3,
        name: "Gối memory foam cho trẻ em",
        price: 450000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        inStock: false,
        addedAt: "2026-01-10",
    },
]

export const mockAddresses: Address[] = [
    {
        id: "1",
        label: "Nhà riêng",
        recipient: "Nguyễn Thị Minh Anh",
        phone: "0912 345 678",
        address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        type: "home",
        isDefault: true,
    },
    {
        id: "2",
        label: "Văn phòng",
        recipient: "Nguyễn Thị Minh Anh",
        phone: "0912 345 678",
        address: "456 Đường Lê Lợi, Phường 1, Quận 3, TP. Hồ Chí Minh",
        type: "office",
        isDefault: false,
    },
]

export const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: "warning",
    processing: "default",
    shipping: "secondary",
    delivered: "success",
    cancelled: "danger",
}
