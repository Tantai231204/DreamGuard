import { useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProductDetail } from "@/hooks/queries/useProduct";
import { Breadcrumb } from "./components/Breadcrumb";
import { SEO } from "@/components/common";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { SafetyCertifications } from "./components/SafetyCertifications";
import { ProductTabs } from "./components/ProductTabs";
import { TradeInSelector } from "./components/TradeInSelector";
import { ProductDetailSkeleton } from "./components/ProductDetailSkeleton";
import { ProductNotFound } from "./components/ProductNotFound";
import { useProductDetailState } from "./hooks/useProductDetailState";
import {
  safetyCertifications,
  productBenefits,
  mockReviews,
  mockEligibleTradeInProducts,
} from "./constants";
import type { ProductSpec, TradeInProduct } from "./types";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const productImageRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch product (getBySlug already includes variants — no separate call needed)
  const {
    data: product,
    isLoading,
    isError: isProductError,
  } = useProductDetail(slug || "", !!slug);

  // 2. Manage state via custom hook (variants come from product.variants)
  const { state, actions, getVariantSize } = useProductDetailState({
    product,
    productImageRef,
  });

  // 3. Derived specs for the Specifications tab
  const apiSpecs: ProductSpec[] = useMemo(() => {
    if (!product) return [];
    const specs: ProductSpec[] = [];
    if (product.material) specs.push({ label: "Material", value: product.material });
    if (product.ageGroup !== null && product.ageGroup !== undefined) {
      specs.push({ label: "Age Group", value: `${product.ageGroup} months` });
    }
    if (product.categoryName) specs.push({ label: "Category", value: product.categoryName });
    if (typeof product.warrantyPolicyDay === "number") {
      specs.push({ label: "Warranty", value: `${product.warrantyPolicyDay} days` });
    }
    if (typeof product.returnPolicyDay === "number") {
      specs.push({ label: "Return Policy", value: `${product.returnPolicyDay} days` });
    }
    if (product.status) specs.push({ label: "Status", value: product.status });
    return specs;
  }, [product]);

  // 4. Loading & Error States
  if (isLoading) return <ProductDetailSkeleton />;
  if (!product || isProductError) return <ProductNotFound />;

  // 5. Normal UI
  const discount = (() => {
    const { price, originalPrice } = state.currentPriceInfo;
    if (!originalPrice || originalPrice <= price) return undefined;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  })();

  // Use real average rating from API, fallback to mock reviews
  const averageRating = product.averageRating > 0
    ? product.averageRating
    : mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

  return (
    <div className="min-h-screen bg-white selection:bg-[var(--color-primary)]/10">
      <SEO
        title={product.name}
        description={product.summary || product.description?.substring(0, 160)}
        image={state.productImages[0]}
        url={window.location.href}
      />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:px-12 xl:max-w-7xl">
        <Breadcrumb productName={product.name} />

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-20">
          {/* Gallery Section - Takes up 7 columns on large screens */}
          <div className="lg:col-span-7" ref={productImageRef}>
            <ProductImageGallery
              images={state.productImages}
              productName={product.name}
              selectedImage={state.selectedImage}
              onSelectImage={actions.setSelectedImage}
              isWishlisted={state.isWishlisted}
              onToggleWishlist={() => actions.setIsWishlisted(p => !p)}
              discount={discount}
              inStock={!state.currentStock.isOutOfStock}
            />
          </div>

          {/* Configuration Section - Takes up 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <ProductInfo
              product={{
                id: product.id,
                name: product.name,
                sku: state.currentVariant?.sku,
                price: state.currentPriceInfo.price,
                originalPrice: state.currentPriceInfo.originalPrice,
                category: product.categoryName || "",
                summary: product.summary,
                material: product.material,
                ageLabel: product.ageGroup ? String(product.ageGroup) : undefined,
                warrantyPolicyDay: product.warrantyPolicyDay,
                returnPolicyDay: product.returnPolicyDay,
              }}
              sku={state.currentVariant?.sku}
              variantLabel={
                [
                  (state.currentVariant?.attributes as { color?: string } | null)?.color,
                  state.currentVariant ? getVariantSize(state.currentVariant) : "",
                ].filter(Boolean).join(" • ") || undefined
              }
              isNewVariant={state.currentVariant?.isNew}
              averageRating={averageRating}
              reviewCount={mockReviews.length}
              selectedColor={state.selectedColor}
              selectedSize={state.selectedSize}
              quantity={state.quantity}
              stockLeft={state.currentStock.stockLeft}
              stockStatusLabel={state.currentStock.stockStatusLabel}
              isOutOfStock={state.currentStock.isOutOfStock}
              colorOptions={state.dynamicColorOptions}
              sizeOptions={state.dynamicSizeOptions}
              disabledColors={state.disabledColors}
              disabledSizes={state.disabledSizes}
              benefits={productBenefits}
              onColorChange={actions.handleColorChange}
              onSizeChange={actions.setUserSelectedSize}
              onQuantityChange={actions.setQuantity}
              onAddToCart={actions.handleAddToCart}
              tradeInValue={state.tradeInValue}
            />

            <TradeInSelector
              eligibleProducts={mockEligibleTradeInProducts}
              selectedProducts={state.selectedTradeInProducts}
              onToggleProduct={(id: string) => actions.setSelectedTradeInProducts((prev: string[]) =>
                prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]
              )}
              onSelectAll={() => actions.setSelectedTradeInProducts(
                mockEligibleTradeInProducts.filter((p: TradeInProduct) => p.canTradeIn).map((p: TradeInProduct) => p.id)
              )}
              onClearAll={() => actions.setSelectedTradeInProducts([])}
              tradeInPercentage={30}
            />
          </div>
        </div>

        <section className="mt-24 space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <SafetyCertifications certifications={safetyCertifications} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ProductTabs
              activeTab={state.activeTab}
              onTabChange={actions.setActiveTab}
              productName={product.name}
              description={product.description}
              specs={apiSpecs}
              reviews={mockReviews}
              averageRating={averageRating}
            />
          </motion.div>
        </section>
      </div>
    </div>
  );
}
