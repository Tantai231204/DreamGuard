import { lazy, Suspense } from 'react';
import { motion } from "framer-motion";

import { SEO } from "@/components/common";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { SafetyCertifications } from "./components/SafetyCertifications";
import { ProductTabs } from "./components/ProductTabs";
import { ProductDetailSkeleton } from "./components/ProductDetailSkeleton";
import { ProductNotFound } from "./components/ProductNotFound";

import { useProductDetailViewModel } from "./hooks/useProductDetailViewModel";

const TradeInSelector = lazy(() => import('./components/TradeInSelector').then(m => ({ default: m.TradeInSelector })));

export default function ProductDetail() {
  const {
    product,
    isLoading,
    isProductError,
    state,
    actions,
    getVariantSize,
    tradeInSummary,
    tradeInConfig,
    eligibleTradeInProducts,
    isTradeInItemsLoading,
    isTradeInEstimateLoading,
    handleCreateTradeInOrder,
    handleToggleTradeIn,
    handleToggleWishlist,
    isWishlisted,
    apiSpecs,
    reviews,
    averageRating,
    certifications,
    productImageRef,
    isAuthenticated,
    tradeInContact
  } = useProductDetailViewModel();

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product || isProductError) return <ProductNotFound />;

  const discount = (() => {
    const { price, originalPrice } = state.currentPriceInfo;
    if (!originalPrice || originalPrice <= price) return undefined;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  })();

  return (
    <div className="min-h-screen bg-white selection:bg-[var(--color-primary)]/10">
      <SEO
        title={product.name}
        description={product.summary || product.description?.substring(0, 160)}
        image={state.productImages[0]}
        url={window.location.href}
      />

      <div className="container mx-auto px-4 py-8 md:py-12 lg:px-12 xl:max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-20">
          <div className="lg:col-span-7" ref={productImageRef}>
            <ProductImageGallery
              images={state.productImages}
              productName={product.name}
              productSummary={product.summary}
              selectedImage={state.selectedImage}
              onSelectImage={actions.setSelectedImage}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
              discount={discount}
              inStock={!state.currentStock.isOutOfStock}
            />
          </div>

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
                isTradeInEligible: tradeInConfig.isTradeInEligible,
                minTradeInPrice: tradeInConfig.minTradeInPrice,
                depositAmount: tradeInConfig.depositAmount,
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
              reviewCount={reviews.length}
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
              onColorChange={actions.handleColorChange}
              onSizeChange={actions.setUserSelectedSize}
              onQuantityChange={actions.setQuantity}
              onAddToCart={actions.handleAddToCart}
              tradeInValue={tradeInSummary.estimatedTradeInValue}
              isCustomSize={state.isCustomSize}
              isCustomColor={state.isCustomColor}
              onIsCustomSizeChange={actions.setIsCustomSize}
              onIsCustomColorChange={actions.setIsCustomColor}
              customDimensions={state.customDimensions}
              onCustomDimensionChange={actions.handleCustomDimensionChange}
              customColorHex={state.customColorHex}
              onCustomColorHexChange={actions.setCustomColorHex}
              colorSurchargePrice={state.currentPriceInfo.colorSurcharge}
              sizeSurchargePrice={state.currentPriceInfo.sizeSurcharge}
              canCustomizeColor={state.canCustomizeColor}
              canCustomizeSize={state.canCustomizeSize}
            />

            <Suspense fallback={null}>
              <TradeInSelector
                isEligible={tradeInConfig.isTradeInEligible}
                eligibleProducts={eligibleTradeInProducts}
                selectedProducts={state.selectedTradeInProducts}
                currentProductVariantId={state.currentVariant?.id}
                onToggleProduct={handleToggleTradeIn}
                tradeInPercentage={30}
                product={product}
                minTradeInPrice={tradeInSummary.minTradeInPrice}
                depositAmount={tradeInSummary.depositAmount}
                currentProductPrice={tradeInSummary.currentProductPrice}
                estimatedTradeInValue={tradeInSummary.estimatedTradeInValue}
                estimatedAmountToPay={tradeInSummary.estimatedAmountToPay}
                isEstimatingPrice={isTradeInEstimateLoading}
                onCreateTradeInOrder={handleCreateTradeInOrder}
                isOpen={state.isTradeInOpen}
                onOpenChange={actions.setIsTradeInOpen}
                isLoadingItems={isTradeInItemsLoading}
                isLoggedIn={isAuthenticated}
                initialContact={tradeInContact}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-24 space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <SafetyCertifications certifications={certifications} />
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
              reviews={reviews}
              averageRating={averageRating}
            />
          </motion.div>
        </section>
      </div>
    </div>
  );
}
