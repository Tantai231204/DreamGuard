import type {
  BabyProfile,
  ProductRecommendation,
  WishlistItem,
  Address,
  Voucher,
} from "./types";

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
    allergies: ["Len"],
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
    allergies: [],
  },
];

export const mockRecommendations: ProductRecommendation[] = [
  {
    id: "1",
    name: "Nệm cao su non cho bé 6-12 tháng",
    price: 1290000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    forAge: "6-12 tháng",
    discount: 15,
  },
  {
    id: "2",
    name: "Chăn cotton organic mềm mại",
    price: 590000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    forAge: "0-3 tuổi",
    discount: 10,
  },
  {
    id: "3",
    name: "Gối chống trào ngược cho bé sơ sinh",
    price: 450000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    forAge: "0-6 tháng",
  },
];



export const mockWishlist: WishlistItem[] = [
  {
    id: 1,
    name: "Bộ chăn ga gối cotton organic",
    price: 1890000,
    originalPrice: 2200000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    inStock: true,
    discount: 14,
    addedAt: "2026-01-18",
  },
  {
    id: 2,
    name: "Nệm cao su non cho bé sơ sinh",
    price: 890000,
    originalPrice: 1100000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    inStock: true,
    discount: 19,
    addedAt: "2026-01-15",
  },
  {
    id: 3,
    name: "Gối memory foam cho trẻ em",
    price: 450000,
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    inStock: false,
    addedAt: "2026-01-10",
  },
];

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
];



export const mockVouchers: Voucher[] = [
  {
    id: "1",
    code: "WELCOME2026",
    title: "Giảm 15% cho đơn hàng đầu tiên",
    description: "Áp dụng cho tất cả sản phẩm, đơn hàng từ 500.000đ",
    discount: 15,
    discountType: "percentage",
    minPurchase: 500000,
    maxDiscount: 200000,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "active",
    category: "Tất cả",
    image:
      "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
    terms: [
      "Chỉ áp dụng cho khách hàng mới",
      "Không áp dụng đồng thời với các chương trình khuyến mãi khác",
      "Giảm tối đa 200.000đ cho mỗi đơn hàng",
      "Voucher không được hoàn lại hoặc quy đổi thành tiền mặt",
    ],
    usageInstructions: [
      "Thêm sản phẩm vào giỏ hàng",
      "Tại trang thanh toán, nhập mã WELCOME2026",
      "Nhấn 'Áp dụng' để hưởng ưu đãi",
    ],
    quantity: 1000,
    usedCount: 342,
  },
  {
    id: "2",
    code: "FREESHIP100",
    title: "Miễn phí vận chuyển",
    description: "Giảm 100.000đ phí ship cho đơn từ 300.000đ",
    discount: 100000,
    discountType: "fixed",
    minPurchase: 300000,
    validFrom: "2026-02-01",
    validTo: "2026-03-31",
    status: "active",
    category: "Vận chuyển",
    terms: [
      "Áp dụng cho mọi địa chỉ giao hàng trong nội thành",
      "Không giới hạn số lần sử dụng",
      "Không áp dụng với giao hàng nhanh trong 2 giờ",
    ],
    usageInstructions: [
      "Chọn sản phẩm và thêm vào giỏ hàng",
      "Nhập mã FREESHIP100 tại bước thanh toán",
      "Phí ship sẽ được giảm ngay lập tức",
    ],
    quantity: 500,
    usedCount: 89,
  },
  {
    id: "3",
    code: "BABYCARE50",
    title: "Giảm 50.000đ cho sản phẩm chăm sóc bé",
    description: "Áp dụng cho các sản phẩm trong danh mục Chăm sóc bé",
    discount: 50000,
    discountType: "fixed",
    minPurchase: 200000,
    validFrom: "2026-02-15",
    validTo: "2026-03-15",
    status: "active",
    category: "Chăm sóc bé",
    terms: [
      "Chỉ áp dụng cho sản phẩm trong danh mục 'Chăm sóc bé'",
      "Giới hạn 1 lần sử dụng/khách hàng/tháng",
      "Đơn hàng tối thiểu 200.000đ",
    ],
    usageInstructions: [
      "Chọn sản phẩm trong danh mục Chăm sóc bé",
      "Nhập mã BABYCARE50 khi thanh toán",
      "Giảm giá áp dụng ngay",
    ],
    quantity: 300,
    usedCount: 156,
  },
  {
    id: "4",
    code: "NEWYEAR2026",
    title: "Giảm 20% đón năm mới",
    description: "Voucher đặc biệt chào năm mới, giảm tối đa 500.000đ",
    discount: 20,
    discountType: "percentage",
    minPurchase: 1000000,
    maxDiscount: 500000,
    validFrom: "2026-01-01",
    validTo: "2026-01-31",
    status: "used",
    usedAt: "2026-01-15",
    category: "Sự kiện",
    terms: [
      "Áp dụng cho tất cả sản phẩm",
      "Giảm tối đa 500.000đ",
      "Chỉ sử dụng được 1 lần",
    ],
    usageInstructions: [
      "Lựa chọn sản phẩm yêu thích",
      "Áp dụng mã NEWYEAR2026",
      "Hoàn tất thanh toán",
    ],
    quantity: 200,
    usedCount: 200,
  },
  {
    id: "5",
    code: "SUMMER2025",
    title: "Giảm 10% hè sôi động",
    description: "Voucher hè 2025 đã hết hạn sử dụng",
    discount: 10,
    discountType: "percentage",
    minPurchase: 500000,
    maxDiscount: 150000,
    validFrom: "2025-06-01",
    validTo: "2025-08-31",
    status: "expired",
    category: "Sự kiện",
    terms: ["Đã hết hạn sử dụng", "Không thể sử dụng sau ngày 31/08/2025"],
    quantity: 1000,
    usedCount: 823,
  },
  {
    id: "6",
    code: "NAPLUXURY30",
    title: "Giảm 30% cho nệm cao cấp",
    description: "Áp dụng cho tất cả các loại nệm cao cấp từ 2.000.000đ",
    discount: 30,
    discountType: "percentage",
    minPurchase: 2000000,
    maxDiscount: 1000000,
    validFrom: "2026-02-20",
    validTo: "2026-04-30",
    status: "active",
    category: "Nệm",
    terms: [
      "Chỉ áp dụng cho sản phẩm nệm cao cấp",
      "Giảm tối đa 1.000.000đ",
      "Đơn hàng tối thiểu 2.000.000đ",
      "Không áp dụng cho sản phẩm đang sale",
    ],
    usageInstructions: [
      "Chọn nệm cao cấp yêu thích",
      "Đảm bảo giá trị đơn hàng từ 2.000.000đ",
      "Nhập mã NAPLUXURY30 để được giảm 30%",
    ],
    quantity: 100,
    usedCount: 23,
  },
];

export const VOUCHER_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  used: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  expired: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};
