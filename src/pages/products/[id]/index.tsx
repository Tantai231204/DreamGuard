import { useState, useMemo, useCallback, useTransition } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockProducts } from '../data';
import { Breadcrumb } from './components/Breadcrumb';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductInfo } from './components/ProductInfo';
import { SafetyCertifications } from './components/SafetyCertifications';
import { ProductTabs } from './components/ProductTabs';
import {
    colorOptions,
    sizeOptions,
    safetyCertifications,
    productBenefits,
    productSpecs,
    mockReviews,
} from './constants';
import type { TabType } from './types';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [isPending, startTransition] = useTransition();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('cream');
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');

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
        startTransition(() => {
            setActiveTab(tab);
        });
    }, []);

    const handleAddToCart = useCallback(() => {
        // TODO: Implement add to cart logic
        console.log('Add to cart:', { product, selectedColor, selectedSize, quantity });
    }, [product, selectedColor, selectedSize, quantity]);

    const handleBuyNow = useCallback(() => {
        // TODO: Implement buy now logic
        console.log('Buy now:', { product, selectedColor, selectedSize, quantity });
    }, [product, selectedColor, selectedSize, quantity]);

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

                    {/* Right - Product Info */}
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
                    />
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
