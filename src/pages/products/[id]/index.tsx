import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/useCart';
import { useCartAnimation } from '@/store/useCartAnimation';
import { mockProducts } from '../data';
import { Breadcrumb } from './components/Breadcrumb';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductInfo } from './components/ProductInfo';
import { SafetyCertifications } from './components/SafetyCertifications';
import { ProductTabs } from './components/ProductTabs';
import { TradeInSelector } from './components/TradeInSelector';
import { calculateTradeInValue, type TradeInProduct } from './utils/tradeIn';
import {
    colorOptions,
    sizeOptions,
    safetyCertifications,
    productBenefits,
    productSpecs,
    mockReviews,
} from './constants';
import type { TabType } from './types';

// Mock eligible products for trade-in
const mockEligibleTradeInProducts: TradeInProduct[] = [
    {
        id: 'TI001',
        orderId: 'ORD001',
        name: 'Premium Baby Foam Mattress Size S',
        image: 'https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg',
        originalPrice: 89.99,
        purchaseDate: '2025-11-15',
        canTradeIn: true,
    },
    {
        id: 'TI002',
        orderId: 'ORD002',
        name: 'Organic Cotton Bedding Set',
        image: 'https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg',
        originalPrice: 45.99,
        purchaseDate: '2025-12-01',
        canTradeIn: true,
    },
    {
        id: 'TI003',
        orderId: 'ORD003',
        name: 'Baby Memory Foam Pillow',
        image: 'https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg',
        originalPrice: 29.99,
        purchaseDate: '2026-01-20',
        canTradeIn: true,
    },
    {
        id: 'TI004',
        orderId: 'ORD004',
        name: 'Newborn Baby Sleepwear',
        image: 'https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg',
        originalPrice: 19.99,
        purchaseDate: '2026-02-01',
        canTradeIn: false,
        reason: 'Product not eligible for trade-in',
    },
];

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { triggerFlyToCart } = useCartAnimation();
    const productImageRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('cream');
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');
    
    // Trade-in state
    const [selectedTradeInProducts, setSelectedTradeInProducts] = useState<string[]>([]);

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

    // Calculate average rating
    const averageRating = useMemo(() => {
        return mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;
    }, []);

    // Calculate discount percentage
    const discount = useMemo(() => {
        if (!product?.originalPrice) return undefined;
        return Math.round((1 - product.price / product.originalPrice) * 100);
    }, [product]);

    // Calculate total trade-in value
    const tradeInValue = useMemo(() => {
        const TRADE_IN_PERCENTAGE = 30;
        return selectedTradeInProducts.reduce((total, productId) => {
            const tradeInProduct = mockEligibleTradeInProducts.find(p => p.id === productId);
            if (tradeInProduct && tradeInProduct.canTradeIn) {
                return total + calculateTradeInValue(tradeInProduct.originalPrice, TRADE_IN_PERCENTAGE);
            }
            return total;
        }, 0);
    }, [selectedTradeInProducts]);

    // Handlers
    const handleColorChange = useCallback((color: string) => {
        setSelectedColor(color);
    }, []);

    const handleSizeChange = useCallback((size: string) => {
        setSelectedSize(size);
    }, []);

    const handleQuantityChange = useCallback((newQuantity: number) => {
        setQuantity(newQuantity);
    }, []);

    const handleSelectImage = useCallback((index: number) => {
        setSelectedImage(index);
    }, []);

    const handleToggleWishlist = useCallback(() => {
        setIsWishlisted(prev => !prev);
    }, []);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    // Trade-in handlers
    const handleToggleTradeInProduct = useCallback((productId: string) => {
        setSelectedTradeInProducts(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    const handleSelectAllTradeIn = useCallback(() => {
        const eligibleIds = mockEligibleTradeInProducts
            .filter(p => p.canTradeIn)
            .map(p => p.id);
        setSelectedTradeInProducts(eligibleIds);
    }, []);

    const handleClearAllTradeIn = useCallback(() => {
        setSelectedTradeInProducts([]);
    }, []);

    // Build trade-in info for cart
    const getTradeInInfoForCart = useCallback(() => {
        if (selectedTradeInProducts.length === 0) return undefined;
        
        const tradeInProducts = mockEligibleTradeInProducts
            .filter(p => selectedTradeInProducts.includes(p.id) && p.canTradeIn)
            .map(p => ({
                id: p.id,
                name: p.name,
                image: p.image,
                originalPrice: p.originalPrice,
                tradeInValue: calculateTradeInValue(p.originalPrice, 30),
            }));
        
        return {
            products: tradeInProducts,
            totalValue: tradeInValue,
        };
    }, [selectedTradeInProducts, tradeInValue]);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        
        // Trigger fly-to-cart animation
        if (productImageRef.current) {
            triggerFlyToCart(product.image, productImageRef.current);
        }
        
        addItem({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity,
            color: selectedColor,
            size: selectedSize,
            tradeIn: getTradeInInfoForCart(),
        });
        
        // Reset trade-in selection after adding to cart
        setSelectedTradeInProducts([]);
    }, [product, quantity, selectedColor, selectedSize, getTradeInInfoForCart, addItem, triggerFlyToCart]);

    const handleBuyNow = useCallback(() => {
        if (!product) return;
        
        addItem({
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity,
            color: selectedColor,
            size: selectedSize,
            tradeIn: getTradeInInfoForCart(),
        });
        
        // Navigate to checkout
        navigate('/checkout');
    }, [product, quantity, selectedColor, selectedSize, getTradeInInfoForCart, addItem, navigate]);

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-6 lg:px-8">
                {/* Breadcrumb */}
                <Breadcrumb productName={product.name} />

                {/* Main Product Section */}
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left - Image Gallery */}
                    <div ref={productImageRef}>
                        <ProductImageGallery
                            images={productImages}
                            productName={product.name}
                            selectedImage={selectedImage}
                            onSelectImage={handleSelectImage}
                            isWishlisted={isWishlisted}
                            onToggleWishlist={handleToggleWishlist}
                            discount={discount}
                            inStock={true}
                        />
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        <ProductInfo
                            product={product}
                            averageRating={averageRating}
                            reviewCount={mockReviews.length}
                            selectedColor={selectedColor}
                            selectedSize={selectedSize}
                            quantity={quantity}
                            colorOptions={colorOptions}
                            sizeOptions={sizeOptions}
                            benefits={productBenefits}
                            onColorChange={handleColorChange}
                            onSizeChange={handleSizeChange}
                            onQuantityChange={handleQuantityChange}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            tradeInValue={tradeInValue}
                        />

                        {/* Trade-In Section */}
                        <TradeInSelector
                            eligibleProducts={mockEligibleTradeInProducts}
                            selectedProducts={selectedTradeInProducts}
                            onToggleProduct={handleToggleTradeInProduct}
                            onSelectAll={handleSelectAllTradeIn}
                            onClearAll={handleClearAllTradeIn}
                            tradeInPercentage={30}
                        />
                    </div>
                </div>

                {/* Safety Certifications Section */}
                <SafetyCertifications certifications={safetyCertifications} />

                {/* Tabs Section */}
                <ProductTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    productName={product.name}
                    specs={productSpecs}
                    reviews={mockReviews}
                    averageRating={averageRating}
                />
            </div>
        </div>
    );
}
