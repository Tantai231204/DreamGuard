import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { useCartAnimation } from "@/store/useCartAnimation";
import {
  useProductDetail,
  useProductVariants,
} from "@/hooks/queries/useProduct";
import type { ProductVariantResponse } from "@/api/types/product.types";
import { Breadcrumb } from "./components/Breadcrumb";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { SafetyCertifications } from "./components/SafetyCertifications";
import { ProductTabs } from "./components/ProductTabs";
import { TradeInSelector } from "./components/TradeInSelector";
import { calculateTradeInValue, type TradeInProduct } from "./utils/tradeIn";
import {
  safetyCertifications,
  productBenefits,
  mockReviews,
} from "./constants";
import type { TabType, ProductSpec } from "./types";

// Mock eligible products for trade-in
const mockEligibleTradeInProducts: TradeInProduct[] = [
  {
    id: "TI001",
    orderId: "ORD001",
    name: "Premium Baby Foam Mattress Size S",
    image:
      "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
    originalPrice: 89.99,
    purchaseDate: "2025-11-15",
    canTradeIn: true,
  },
  {
    id: "TI002",
    orderId: "ORD002",
    name: "Organic Cotton Bedding Set",
    image:
      "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
    originalPrice: 45.99,
    purchaseDate: "2025-12-01",
    canTradeIn: true,
  },
  {
    id: "TI003",
    orderId: "ORD003",
    name: "Baby Memory Foam Pillow",
    image:
      "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
    originalPrice: 29.99,
    purchaseDate: "2026-01-20",
    canTradeIn: true,
  },
  {
    id: "TI004",
    orderId: "ORD004",
    name: "Newborn Baby Sleepwear",
    image:
      "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
    originalPrice: 19.99,
    purchaseDate: "2026-02-01",
    canTradeIn: false,
    reason: "Product not eligible for trade-in",
  },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { triggerFlyToCart } = useCartAnimation();
  const productImageRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("description");

  // Trade-in state
  const [selectedTradeInProducts, setSelectedTradeInProducts] = useState<
    string[]
  >([]);

  // Fetch product detail & variants from API
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError: isProductError,
  } = useProductDetail(id || "", !!id);

  const { data: routeVariants, isLoading: isLoadingVariants } =
    useProductVariants(id || "", !!id);

  const isLoading = isLoadingProduct || isLoadingVariants;

  const allVariants: ProductVariantResponse[] = useMemo(() => {
    if (routeVariants && routeVariants.length > 0) {
      return routeVariants;
    }
    if (product?.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  }, [product, routeVariants]);

  // Build color & size options from variants
  const dynamicColorOptions = useMemo(() => {
    const colorHexMap: Record<string, string> = {
      cream: "#F5F5DC",
      pink: "#FFB6C1",
      blue: "#87CEEB",
      mint: "#98FB98",
      white: "#FFFFFF",
      gray: "#D1D5DB",
    };

    // Aggregate by normalized color value; preserve raw label + hex if provided from API
    const aggregate = new Map<
      string,
      {
        label: string;
        hex?: string;
      }
    >();

    for (const v of allVariants) {
      const attrs = (v.attributes || {}) as { color?: string };
      const rawColor = attrs.color?.trim();
      if (!rawColor) continue;

      const key = rawColor.toLowerCase();
      const isHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(rawColor);
      const existing = aggregate.get(key);

      if (!existing) {
        aggregate.set(key, {
          label: rawColor,
          hex: isHex ? rawColor : undefined,
        });
      } else if (!existing.hex && isHex) {
        existing.hex = rawColor;
      }
    }

    return Array.from(aggregate.entries()).map(([value, meta]) => ({
      value,
      label: meta.label,
      // Prefer hex from API; fall back to predefined palette; final fallback: neutral gray
      color: meta.hex ?? colorHexMap[value] ?? "#F3F4F6",
    }));
  }, [allVariants]);

  const dynamicSizeOptions = useMemo(() => {
    const sizes = Array.from(
      new Set(
        allVariants
          .map((v) => v.size?.toString().trim())
          .filter((s): s is string => !!s),
      ),
    );

    return sizes.map((value) => {
      const variant = allVariants.find((v) => v.size === value);
      const attrs = (variant?.attributes || {}) as {
        width?: number;
        length?: number;
        thickness?: number;
      };
      const dimensions =
        attrs.width && attrs.length
          ? `${attrs.width}x${attrs.length}${attrs.thickness ? `x${attrs.thickness}` : ""} cm`
          : "";

      return {
        value,
        label: value,
        description: dimensions || "Standard size",
      };
    });
  }, [allVariants]);

  // Initialize default selections once variants have loaded (first render only)
  useEffect(() => {
    if (!allVariants.length) return;
    setSelectedColor((prev) => {
      if (prev) return prev;
      const first = allVariants[0];
      const attrs = (first.attributes || {}) as { color?: string };
      return attrs.color?.toLowerCase() ?? "";
    });
    setSelectedSize((prev) => {
      if (prev) return prev;
      const first = allVariants[0];
      return first.size ?? "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock additional images for gallery
  const productImages = useMemo(() => {
    if (!product) return [];
    const urls = product.assets?.map((a) => a.url).filter(Boolean) ?? [];
    if (urls.length === 0) {
      return ["/images/placeholder-product.svg"];
    }
    return urls;
  }, [product]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    return (
      mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length
    );
  }, []);

  // Calculate discount percentage
  const discount = useMemo(() => {
    if (!product) return undefined;
    const currentVariant =
      allVariants.find((v) => {
        const attrs = (v.attributes || {}) as { color?: string };
        const color = attrs.color?.toLowerCase();
        return (
          (!selectedColor || color === selectedColor.toLowerCase()) &&
          (!selectedSize || v.size === selectedSize)
        );
      }) ?? allVariants[0];

    const price =
      currentVariant?.salePrice ??
      currentVariant?.basePrice ??
      product.minPrice ??
      0;
    const originalPrice = currentVariant?.basePrice ?? product.maxPrice;

    if (!originalPrice || originalPrice <= price) return undefined;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [product, allVariants, selectedColor, selectedSize]);

  const currentVariant = useMemo(() => {
    if (!allVariants.length) return undefined;
    const match = allVariants.find((v) => {
      const attrs = (v.attributes || {}) as { color?: string };
      const color = attrs.color?.toLowerCase();
      return (
        (!selectedColor || color === selectedColor.toLowerCase()) &&
        (!selectedSize || v.size === selectedSize)
      );
    });
    return match ?? allVariants[0];
  }, [allVariants, selectedColor, selectedSize]);

  // Build availability maps: which colors and sizes still have stock
  const { colorsWithStock, sizesWithStock, sizeByColor } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const map = new Map<string, Set<string>>();

    for (const v of allVariants) {
      const attrs = (v.attributes || {}) as { color?: string };
      const color = attrs.color?.toLowerCase().trim();
      const size = v.size?.toString().trim();
      const inStock =
        typeof v.stockQuantity === "number" ? v.stockQuantity > 0 : true;
      if (!inStock) continue;

      if (color) {
        colors.add(color);
        if (!map.has(color)) {
          map.set(color, new Set<string>());
        }
        if (size) {
          map.get(color)?.add(size);
          sizes.add(size);
        }
      } else if (size) {
        sizes.add(size);
      }
    }

    return { colorsWithStock: colors, sizesWithStock: sizes, sizeByColor: map };
  }, [allVariants]);

  const currentPriceInfo = useMemo(() => {
    if (!product)
      return { price: 0, originalPrice: undefined as number | undefined };

    const price =
      currentVariant?.salePrice ??
      currentVariant?.basePrice ??
      product.minPrice ??
      0;
    const originalPrice =
      currentVariant?.basePrice && currentVariant.basePrice > price
        ? currentVariant.basePrice
        : product.maxPrice && product.maxPrice > price
          ? product.maxPrice
          : undefined;

    return { price, originalPrice };
  }, [product, currentVariant]);

  const currentStock = useMemo(() => {
    if (!currentVariant) {
      return {
        stockLeft: undefined as number | undefined,
        stockStatusLabel: undefined as string | undefined,
        isOutOfStock: false,
      };
    }
    const stockLeft = currentVariant.stockQuantity;
    let stockStatusLabel: string | undefined;
    let isOutOfStock = false;

    if (typeof stockLeft === "number") {
      if (stockLeft === 0) {
        stockStatusLabel = "Out of stock";
        isOutOfStock = true;
      } else if (stockLeft < 5) {
        stockStatusLabel = `Only ${stockLeft} left`;
      } else {
        stockStatusLabel = `${stockLeft} in stock`;
      }
    }

    return { stockLeft, stockStatusLabel, isOutOfStock };
  }, [currentVariant]);

  // Derive human-readable age label from ageGroup for reuse
  const ageLabel = useMemo(() => {
    return product?.ageGroup || undefined;
  }, [product?.ageGroup]);

  // Build ProductSpec[] from API data for the "Specifications" tab
  const apiSpecs: ProductSpec[] = useMemo(() => {
    if (!product) return [];
    const specs: ProductSpec[] = [];

    if (product.material) {
      specs.push({ label: "Material", value: product.material });
    }
    if (ageLabel) {
      specs.push({ label: "Age Range", value: ageLabel });
    }
    if (product.categoryName) {
      specs.push({ label: "Category", value: product.categoryName });
    }
    if (typeof product.warrantyPolicyDay === "number") {
      specs.push({
        label: "Warranty",
        value: `${product.warrantyPolicyDay} days`,
      });
    }
    if (typeof product.returnPolicyDay === "number") {
      specs.push({
        label: "Return Policy",
        value: `${product.returnPolicyDay} days`,
      });
    }

    return specs;
  }, [product, ageLabel]);

  // Disabled options for color & size pickers based on stock
  const disabledColorValues = useMemo(
    () =>
      dynamicColorOptions
        .map((c) => c.value)
        .filter((value) => !colorsWithStock.has(value.toLowerCase())),
    [dynamicColorOptions, colorsWithStock],
  );

  const disabledSizeValues = useMemo(() => {
    // Sizes that have stock for current color (or globally if no color selected)
    let allowedSizes: Set<string> | undefined;
    if (selectedColor) {
      allowedSizes = sizeByColor.get(selectedColor.toLowerCase());
    } else {
      allowedSizes = sizesWithStock;
    }

    if (!allowedSizes || allowedSizes.size === 0) {
      return dynamicSizeOptions.map((s) => s.value);
    }

    return dynamicSizeOptions
      .map((s) => s.value)
      .filter((value) => !allowedSizes!.has(value));
  }, [dynamicSizeOptions, selectedColor, sizeByColor, sizesWithStock]);

  // Calculate total trade-in value
  const tradeInValue = useMemo(() => {
    const TRADE_IN_PERCENTAGE = 30;
    return selectedTradeInProducts.reduce((total, productId) => {
      const tradeInProduct = mockEligibleTradeInProducts.find(
        (p) => p.id === productId,
      );
      if (tradeInProduct && tradeInProduct.canTradeIn) {
        return (
          total +
          calculateTradeInValue(
            tradeInProduct.originalPrice,
            TRADE_IN_PERCENTAGE,
          )
        );
      }
      return total;
    }, 0);
  }, [selectedTradeInProducts]);

  // Handlers
  const handleColorChange = useCallback(
    (color: string) => {
      setSelectedColor(color);

      // When switching color, auto-pick first available size for that color
      const sizesForColor = sizeByColor.get(color.toLowerCase());
      if (sizesForColor && sizesForColor.size > 0) {
        setSelectedSize((prev) =>
          prev && sizesForColor.has(prev) ? prev : Array.from(sizesForColor)[0],
        );
      } else {
        setSelectedSize("");
      }
    },
    [sizeByColor],
  );

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
    setIsWishlisted((prev) => !prev);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Trade-in handlers
  const handleToggleTradeInProduct = useCallback((productId: string) => {
    setSelectedTradeInProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const handleSelectAllTradeIn = useCallback(() => {
    const eligibleIds = mockEligibleTradeInProducts
      .filter((p) => p.canTradeIn)
      .map((p) => p.id);
    setSelectedTradeInProducts(eligibleIds);
  }, []);

  const handleClearAllTradeIn = useCallback(() => {
    setSelectedTradeInProducts([]);
  }, []);

  // Build trade-in info for cart
  const getTradeInInfoForCart = useCallback(() => {
    if (selectedTradeInProducts.length === 0) return undefined;

    const tradeInProducts = mockEligibleTradeInProducts
      .filter((p) => selectedTradeInProducts.includes(p.id) && p.canTradeIn)
      .map((p) => ({
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

    const { price } = currentPriceInfo;

    // Trigger fly-to-cart animation
    if (productImageRef.current) {
      const mainImage = productImages[0] || "/images/placeholder-product.svg";
      triggerFlyToCart(mainImage, productImageRef.current);
    }

    addItem({
      id: product.id,
      name: product.name,
      image: productImages[0] || "/images/placeholder-product.svg",
      price,
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      tradeIn: getTradeInInfoForCart(),
    });

    // Reset trade-in selection after adding to cart
    setSelectedTradeInProducts([]);
  }, [
    product,
    quantity,
    selectedColor,
    selectedSize,
    getTradeInInfoForCart,
    addItem,
    triggerFlyToCart,
    currentPriceInfo,
    productImages,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;

    const { price } = currentPriceInfo;

    addItem({
      id: product.id,
      name: product.name,
      image: productImages[0] || "/images/placeholder-product.svg",
      price,
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      tradeIn: getTradeInInfoForCart(),
    });

    // Navigate to checkout
    navigate("/checkout");
  }, [
    product,
    quantity,
    selectedColor,
    selectedSize,
    getTradeInInfoForCart,
    addItem,
    navigate,
    currentPriceInfo,
    productImages,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="h-[420px] rounded-2xl bg-gray-100 animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-gray-100 animate-pulse" />
              <div className="h-5 w-1/2 rounded bg-gray-100 animate-pulse" />
              <div className="h-10 w-full rounded bg-gray-100 animate-pulse" />
              <div className="h-10 w-full rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || isProductError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
        <p className="mt-2 text-gray-500">
          The product you're looking for doesn't exist.
        </p>
        <Button
          className="mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
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
              inStock={!currentStock.isOutOfStock}
            />
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            <ProductInfo
              product={{
                id: product.id,
                name: product.name,
                sku: currentVariant?.sku,
                price: currentPriceInfo.price,
                originalPrice: currentPriceInfo.originalPrice,
                category: product.categoryName || "",
                summary: product.summary,
                material: product.material,
                ageLabel,
                warrantyPolicyDay: product.warrantyPolicyDay,
                returnPolicyDay: product.returnPolicyDay,
              }}
              sku={currentVariant?.sku}
              variantLabel={
                [
                  (currentVariant?.attributes as { color?: string } | null)
                    ?.color,
                  currentVariant?.size,
                ]
                  .filter(Boolean)
                  .join(" • ") || undefined
              }
              isNewVariant={currentVariant?.isNew}
              averageRating={averageRating}
              reviewCount={mockReviews.length}
              selectedColor={
                selectedColor || dynamicColorOptions[0]?.value || ""
              }
              selectedSize={selectedSize || dynamicSizeOptions[0]?.value || ""}
              quantity={quantity}
              stockLeft={currentStock.stockLeft}
              stockStatusLabel={currentStock.stockStatusLabel}
              isOutOfStock={currentStock.isOutOfStock}
              colorOptions={dynamicColorOptions}
              sizeOptions={dynamicSizeOptions}
              disabledColors={disabledColorValues}
              disabledSizes={disabledSizeValues}
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
          description={product.description}
          specs={apiSpecs}
          reviews={mockReviews}
          averageRating={averageRating}
        />
      </div>
    </div>
  );
}
