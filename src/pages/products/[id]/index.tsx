import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart,
    Minus,
    Plus,
    Star,
    ShieldCheck,
    Award,
    Leaf,
    BadgeCheck,
    Truck,
    RotateCcw,
    Package,
    ChevronRight,
    ThumbsUp,
    Check,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockProducts } from '../data';

// Color options
const colorOptions = [
    { value: 'cream', label: 'Cream', color: '#F5F5DC' },
    { value: 'pink', label: 'Pink', color: '#FFB6C1' },
    { value: 'blue', label: 'Sky Blue', color: '#87CEEB' },
    { value: 'mint', label: 'Mint Green', color: '#98FB98' },
];

// Size options
const sizeOptions = [
    { value: 'S', label: 'S', description: '60x120cm' },
    { value: 'M', label: 'M', description: '70x140cm' },
    { value: 'L', label: 'L', description: '80x160cm' },
];

// Safety certifications
const safetyCertifications = [
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

// Product features/benefits
const productBenefits = [
    { icon: Truck, label: 'Free Shipping', description: 'Orders $50+' },
    { icon: RotateCcw, label: '30-Day Returns', description: 'Free returns' },
    { icon: ShieldCheck, label: '12-Month Warranty', description: 'Authentic' },
    { icon: Package, label: 'Premium Packaging', description: 'Gift box' },
];

// Product specifications
const productSpecs = [
    { label: 'Material', value: '100% Organic Cotton' },
    { label: 'Origin', value: 'Vietnam' },
    { label: 'Age Range', value: '0 - 6 years' },
    { label: 'Machine Washable', value: 'Yes (≤40°C)' },
    { label: 'Antibacterial', value: 'Yes' },
    { label: 'Absorbency', value: 'High' },
];

// Mock reviews data
const mockReviews = [
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

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('cream');
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

    // Find product by id or slug
    const product = useMemo(() => {
        return mockProducts.find(p => p.id === id || p.slug === id);
    }, [id]);

    // Mock additional images for gallery
    const productImages = useMemo(() => {
        if (!product) return [];
        return [
            product.image,
            product.image,
            product.image,
            product.image,
        ];
    }, [product]);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
                <p className="mt-2 text-gray-500">The product you're looking for doesn't exist.</p>
                <Link to="/products">
                    <Button className="mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
                        Back to Shop
                    </Button>
                </Link>
            </div>
        );
    }

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const averageRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                {/* Breadcrumb */}
                <motion.nav
                    className="mb-6 flex items-center gap-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link to="/" className="text-gray-500 transition-colors hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <Link to="/products" className="text-gray-500 transition-colors hover:text-[var(--color-primary)]">
                        Products
                    </Link>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-[var(--color-primary)]">{product.name}</span>
                </motion.nav>

                {/* Main Product Section */}
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left - Image Gallery */}
                    <motion.div
                        className="space-y-4"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Main Image */}
                        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
                            <div className="aspect-square">
                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>

                            {/* Badges */}
                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                                {product.originalPrice && (
                                    <Badge className="bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </Badge>
                                )}
                                <Badge className="bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                                    In Stock
                                </Badge>
                            </div>

                            {/* Wishlist Button */}
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={cn(
                                    "absolute right-4 top-4 rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition-all hover:scale-110",
                                    isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                                )}
                            >
                                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                            </button>
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="flex gap-3">
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={cn(
                                        "relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                                        selectedImage === index
                                            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} - ${index + 1}`}
                                        className="h-20 w-20 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right - Product Info */}
                    <motion.div
                        className="space-y-6"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                    >
                        {/* Category Badge */}
                        <Badge variant="secondary" className="bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            {product.category}
                        </Badge>

                        {/* Title */}
                        <h1 className="text-2xl font-bold leading-tight text-gray-900 lg:text-3xl">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-5 w-5",
                                            i < Math.floor(averageRating)
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-gray-200 text-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                            <span className="text-gray-500">({mockReviews.length} reviews)</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-green-600">150+ sold</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-[var(--color-primary)]">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                    <Badge className="bg-red-100 text-red-600">
                                        Save {formatPrice(product.originalPrice - product.price)}
                                    </Badge>
                                </>
                            )}
                        </div>

                        {/* Short Description */}
                        <p className="text-gray-600 leading-relaxed">
                            Premium baby bedding set made from 100% organic cotton, incredibly soft and absolutely safe for your baby's sensitive skin. Certified by international child product safety standards.
                        </p>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Color:</span>
                                <span className="text-sm text-gray-500">
                                    {colorOptions.find(c => c.value === selectedColor)?.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        className={cn(
                                            "relative h-10 w-10 rounded-full border-2 transition-all duration-200",
                                            selectedColor === color.value
                                                ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                        style={{ backgroundColor: color.color }}
                                        title={color.label}
                                    >
                                        {selectedColor === color.value && (
                                            <Check className="absolute inset-0 m-auto h-5 w-5 text-gray-700" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Size:</span>
                                <button className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline">
                                    <Info className="h-4 w-4" />
                                    Size Guide
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {sizeOptions.map((size) => (
                                    <button
                                        key={size.value}
                                        onClick={() => setSelectedSize(size.value)}
                                        className={cn(
                                            "flex flex-col items-center rounded-xl border-2 px-5 py-3 transition-all duration-200",
                                            selectedSize === size.value
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <span className="font-semibold">{size.label}</span>
                                        <span className="text-xs text-gray-500">{size.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-700">Quantity:</span>
                            <div className="flex items-center rounded-xl border border-gray-200 bg-white">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-medium text-gray-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">50 items left</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-2">
                            <Button
                                size="lg"
                                className="flex-1 rounded-xl bg-[var(--color-primary)] py-6 text-base font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-xl"
                            >
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 rounded-xl border-2 border-[var(--color-primary)] py-6 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/5"
                            >
                                Buy Now
                            </Button>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {productBenefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                                        <benefit.icon className="h-5 w-5 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{benefit.label}</p>
                                        <p className="text-xs text-gray-500">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Safety Certifications Section */}
                <motion.section
                    className="mt-16"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="mb-8 text-center">
                        <Badge className="mb-3 bg-green-100 text-green-700">
                            <ShieldCheck className="mr-1 h-4 w-4" />
                            Safe for Your Baby
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900">
                            International Safety Certifications
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Products meet the highest safety standards for children
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {safetyCertifications.map((cert, index) => (
                            <motion.div
                                key={cert.id}
                                variants={fadeInUp}
                                custom={index}
                            >
                                <Card className={cn(
                                    "group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
                                    cert.borderColor,
                                    cert.bgColor
                                )}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                                                cert.iconColor
                                            )}>
                                                <cert.icon className="h-7 w-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                                <p className="text-sm font-medium text-gray-600">{cert.fullName}</p>
                                                <p className="mt-1 text-xs text-gray-500">{cert.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Additional Safety Info */}
                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">100% Safety Guaranteed</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    All DreamGuard products are rigorously tested and meet international safety certifications.
                                    Free from formaldehyde, allergens, and harmful dyes. Absolutely safe for your baby's sensitive skin.
                                </p>
                            </div>
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                Learn More
                            </Button>
                        </div>
                    </div>
                </motion.section>

                {/* Tabs Section */}
                <motion.section
                    className="mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Tab Headers */}
                    <div className="flex gap-1 border-b border-gray-200">
                        {[
                            { key: 'description', label: 'Description' },
                            { key: 'specs', label: 'Specifications' },
                            { key: 'reviews', label: `Reviews (${mockReviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={cn(
                                    "relative px-6 py-4 text-sm font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "text-[var(--color-primary)]"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="py-8">
                        {activeTab === 'description' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-gray max-w-none"
                            >
                                <div className="space-y-4 text-gray-600 leading-relaxed">
                                    <p>
                                        The <strong>{product.name}</strong> bedding set is specially designed for young children,
                                        made from 100% natural organic cotton that's soft and gentle on your baby's sensitive skin.
                                    </p>
                                    <p>
                                        This set includes: 1 fitted sheet, 1 bolster pillow, and 2 pillowcases, decorated with
                                        adorable bunny patterns on a soft cream background, creating a warm and relaxing sleep environment for your little one.
                                    </p>
                                    <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>100% Organic Cotton, free from harmful chemicals</li>
                                        <li>Soft, breathable fabric with excellent moisture absorption</li>
                                        <li>Gentle colors that are easy on the eyes</li>
                                        <li>Durable stitching with safe, rounded edges</li>
                                        <li>Easy machine wash at temperatures ≤40°C</li>
                                        <li>Certified by international safety standards: OEKO-TEX, GOTS, CPSC, CE</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'specs' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    {productSpecs.map((spec, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center justify-between px-6 py-4",
                                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            )}
                                        >
                                            <span className="font-medium text-gray-700">{spec.label}</span>
                                            <span className="text-gray-900">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Reviews Summary */}
                                <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:flex-row">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                                        <div className="mt-2 flex items-center justify-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-5 w-5",
                                                        i < Math.floor(averageRating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-gray-200 text-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{mockReviews.length} reviews</p>
                                    </div>
                                    <div className="h-px w-full bg-amber-200 sm:h-20 sm:w-px" />
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = mockReviews.filter(r => Math.floor(r.rating) === star).length;
                                            const percentage = (count / mockReviews.length) * 100;
                                            return (
                                                <div key={star} className="flex items-center gap-3">
                                                    <span className="w-8 text-sm text-gray-600">{star} ★</span>
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-amber-400 transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-12 text-sm text-gray-500">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {mockReviews.map((review) => (
                                        <Card key={review.id} className="overflow-hidden">
                                            <CardContent className="p-6">
                                                <div className="flex gap-4">
                                                    <img
                                                        src={review.avatar}
                                                        alt={review.name}
                                                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                                                            {review.verified && (
                                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                                    <Check className="mr-1 h-3 w-3" />
                                                                    Verified Purchase
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={cn(
                                                                            "h-4 w-4",
                                                                            i < review.rating
                                                                                ? "fill-amber-400 text-amber-400"
                                                                                : "fill-gray-200 text-gray-200"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-400">•</span>
                                                            <span className="text-sm text-gray-500">{review.date}</span>
                                                        </div>
                                                        <p className="mt-3 text-gray-600 leading-relaxed">
                                                            {review.comment}
                                                        </p>
                                                        <div className="mt-4 flex items-center gap-4">
                                                            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-primary)]">
                                                                <ThumbsUp className="h-4 w-4" />
                                                                Helpful ({review.helpful})
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Load More */}
                                <div className="text-center">
                                    <Button variant="outline" className="px-8">
                                        Load More Reviews
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
