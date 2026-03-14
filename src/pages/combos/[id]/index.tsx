import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Components
import { 
    ComboImageGallery, 
    ComboInfo, 
    ComboVariants, 
    ComboActions, 
    ComboTabs,
    ComboIncludedItems
} from "./components";
import { SafetyCertifications } from "../../products/[slug]/components/SafetyCertifications";

// Constants
import { safetyCertifications } from "../../products/[slug]/constants";

// Hooks
import { useComboDetail } from "./hooks/useComboDetail";

/* ============================================================================
   Loading Skeleton
   ============================================================================ */
const DetailSkeleton = () => (
    <div className="container mx-auto px-4 py-12 lg:px-12 xl:max-w-7xl">
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="grid gap-20 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-6">
                <Skeleton className="aspect-square w-full rounded-[3rem]" />
                <div className="flex gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-20 rounded-2xl" />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-6 w-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-32 w-full rounded-[2.5rem]" />
                <div className="space-y-8">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    </div>
);

/* ============================================================================
   Main Page Component
   ============================================================================ */
export default function ComboDetail() {
    const navigate = useNavigate();
    const {
        combo,
        isLoading,
        isError,
        activeCombo,
        selectedVariantId,
        quantity,
        isWishlisted,
        setQuantity,
        setUserSelectedVariantId,
        handleAddToCart,
        toggleWishlist
    } = useComboDetail();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <DetailSkeleton />
            </div>
        );
    }

    if (isError || !combo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                    <Package className="w-8 h-8 text-slate-200" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Combo Not Found</h2>
                <p className="text-slate-500 mb-8">The bundle you are looking for might have expired or been removed.</p>
                <Button onClick={() => navigate("/combos")} className="rounded-xl px-8 font-bold">
                    Back to Collection
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <SEO 
                title={`${combo.name} | DreamGuard`}
                description={combo.description}
                image={combo.imageUrl}
            />

            <main className="container mx-auto px-4 py-8 md:py-12 lg:px-12 xl:max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    
                    {/* LEFT: Gallery Section (7 cols) */}
                    <div className="lg:col-span-7">
                        <ComboImageGallery 
                            combo={combo}
                            activeCombo={activeCombo}
                            isWishlisted={isWishlisted}
                            onToggleWishlist={toggleWishlist}
                        />
                    </div>

                    {/* RIGHT: Content Section (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-10">
                        <ComboInfo 
                            combo={combo}
                            activeCombo={activeCombo}
                        />

                        <ComboVariants 
                            combo={combo}
                            activeCombo={activeCombo}
                            selectedVariantId={selectedVariantId}
                            onSelectVariant={setUserSelectedVariantId}
                        />

                        <ComboActions 
                            combo={combo}
                            activeCombo={activeCombo}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                {/* Section: Bundle Contents Highlight */}
                <div className="mt-20">
                    <ComboIncludedItems combo={combo} />
                </div>

                {/* Bottom Section: Syncing with Product Detail Tabs style */}
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
                        <ComboTabs combo={combo} />
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
