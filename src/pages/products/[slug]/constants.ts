import {
    ShieldCheck,
    Award,
    Leaf,
    BadgeCheck,
    Truck,
    RotateCcw,
    Package,
} from 'lucide-react';
import type { ColorOption, SizeOption, SafetyCertification, ProductBenefit, ProductSpec, Review, TradeInProduct } from './types';

export const colorOptions: ColorOption[] = [
    { value: 'cream', label: 'Cream', color: '#F5F5DC' },
    { value: 'pink', label: 'Pink', color: '#FFB6C1' },
    { value: 'blue', label: 'Sky Blue', color: '#87CEEB' },
    { value: 'mint', label: 'Mint Green', color: '#98FB98' },
];

export const sizeOptions: SizeOption[] = [
    { value: 'S', label: 'S', description: '60x120cm' },
    { value: 'M', label: 'M', description: '70x140cm' },
    { value: 'L', label: 'L', description: '80x160cm' },
];

export const safetyCertifications: SafetyCertification[] = [
    {
        id: 'oeko',
        name: 'OEKO-TEX®',
        fullName: 'Standard 100',
        description: 'Certified free from harmful substances, safe for baby skin',
        icon: ShieldCheck,
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
    },
    {
        id: 'gots',
        name: 'GOTS',
        fullName: 'Organic Cotton',
        description: 'Global Organic Textile Standard certified',
        icon: Leaf,
        bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
    },
    {
        id: 'cpsc',
        name: 'CPSC',
        fullName: 'USA Safety',
        description: 'Meets U.S. Consumer Product Safety Standards',
        icon: Award,
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
    },
    {
        id: 'ce',
        name: 'CE',
        fullName: 'EU Certified',
        description: 'Meets European Union safety standards',
        icon: BadgeCheck,
        bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
    },
];

export const productBenefits: ProductBenefit[] = [
    { icon: Truck, label: 'Free Shipping', description: 'Orders $50+' },
    { icon: RotateCcw, label: '30-Day Returns', description: 'Free returns' },
    { icon: ShieldCheck, label: '12-Month Warranty', description: 'Authentic' },
    { icon: Package, label: 'Premium Packaging', description: 'Gift box' },
];

export const productSpecs: ProductSpec[] = [
    { label: 'Material', value: '100% Organic Cotton' },
    { label: 'Origin', value: 'Vietnam' },
    { label: 'Age Range', value: '0 - 6 years' },
    { label: 'Machine Washable', value: 'Yes (≤40°C)' },
    { label: 'Antibacterial', value: 'Yes' },
    { label: 'Absorbency', value: 'High' },
];

export const mockReviews: Review[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/100?img=1',
        rating: 5,
        date: 'Jan 15, 2026',
        comment: 'Excellent product! The material is so soft and safe for my baby. My little one loves the cute colors. Carefully packaged and fast delivery. Very satisfied with the quality!',
        helpful: 24,
        verified: true,
    },
    {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://i.pravatar.cc/100?img=2',
        rating: 5,
        date: 'Jan 10, 2026',
        comment: 'Amazing quality, exactly as described. The 100% cotton fabric is so breathable, my baby sleeps so well now. Love the safety certifications included. Will definitely buy more!',
        helpful: 18,
        verified: true,
    },
    {
        id: '3',
        name: 'Emily Davis',
        avatar: 'https://i.pravatar.cc/100?img=3',
        rating: 4,
        date: 'Jan 5, 2026',
        comment: 'Beautiful product, soft colors that match my baby\'s room perfectly. The fabric is smooth and doesn\'t irritate the skin. However, it\'s slightly thinner than I expected.',
        helpful: 12,
        verified: false,
    },
];

export const mockEligibleTradeInProducts: TradeInProduct[] = [
    {
        id: "TI001",
        orderId: "ORD001",
        name: "Premium Baby Foam Mattress Size S",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 89.99,
        purchaseDate: "2025-11-15",
        canTradeIn: true,
    },
    {
        id: "TI002",
        orderId: "ORD002",
        name: "Organic Cotton Bedding Set",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 45.99,
        purchaseDate: "2025-12-01",
        canTradeIn: true,
    },
    {
        id: "TI003",
        orderId: "ORD003",
        name: "Baby Memory Foam Pillow",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 29.99,
        purchaseDate: "2026-01-20",
        canTradeIn: true,
    },
    {
        id: "TI004",
        orderId: "ORD004",
        name: "Newborn Baby Sleepwear",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 19.99,
        purchaseDate: "2026-02-01",
        canTradeIn: false,
        reason: "Product not eligible for trade-in",
    },
];

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};
