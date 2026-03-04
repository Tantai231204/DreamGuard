import { memo, Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './ReviewCard';
import { ReviewsSummary } from './ReviewsSummary';
import type { TabType, ProductSpec, Review } from '../types';

// Loading skeleton
const TabContentSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
);

interface ProductTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    productName: string;
    /** Full rich description from API (fallback to marketing copy if missing) */
    description?: string | null;
    /** Structured specs (built from API fields by caller) */
    specs: ProductSpec[];
    /** Reviews – currently mock data, can be wired to API later */
    reviews: Review[];
    averageRating: number;
}

export const ProductTabs = memo(({
    activeTab,
    onTabChange,
    productName,
    description,
    specs,
    reviews,
    averageRating
}: ProductTabsProps) => {
    return (
        <section className="mt-16">
            <Tabs.Root value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
                {/* Tab Headers */}
                <Tabs.List className="flex gap-1 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <Tabs.Trigger
                        value="description"
                        className="relative px-6 py-4 text-sm font-medium transition-all data-[state=active]:text-[var(--color-primary)] data-[state=inactive]:text-gray-500 hover:text-gray-700 hover:bg-gray-50 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[var(--color-primary)] data-[state=active]:after:animate-in data-[state=active]:after:slide-in-from-left"
                    >
                        Description
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="specs"
                        className="relative px-6 py-4 text-sm font-medium transition-all data-[state=active]:text-[var(--color-primary)] data-[state=inactive]:text-gray-500 hover:text-gray-700 hover:bg-gray-50 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[var(--color-primary)] data-[state=active]:after:animate-in data-[state=active]:after:slide-in-from-left"
                    >
                        Specifications
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="reviews"
                        className="relative px-6 py-4 text-sm font-medium transition-all data-[state=active]:text-[var(--color-primary)] data-[state=inactive]:text-gray-500 hover:text-gray-700 hover:bg-gray-50 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[var(--color-primary)] data-[state=active]:after:animate-in data-[state=active]:after:slide-in-from-left"
                    >
                        Reviews ({reviews.length})
                    </Tabs.Trigger>
                </Tabs.List>

                {/* Tab Content with Suspense */}
                <Tabs.Content value="description" className="py-8">
                    <Suspense fallback={<TabContentSkeleton />}>
                        <DescriptionTab
                            productName={productName}
                            description={description ?? undefined}
                        />
                    </Suspense>
                </Tabs.Content>

                <Tabs.Content value="specs" className="py-8">
                    <Suspense fallback={<TabContentSkeleton />}>
                        <SpecsTab specs={specs} />
                    </Suspense>
                </Tabs.Content>

                <Tabs.Content value="reviews" className="py-8">
                    <Suspense fallback={<TabContentSkeleton />}>
                        <ReviewsTab
                            reviews={reviews}
                            averageRating={averageRating}
                        />
                    </Suspense>
                </Tabs.Content>
            </Tabs.Root>
        </section>
    );
});
ProductTabs.displayName = 'ProductTabs';

// Sub-components với animations mượt hơn
const DescriptionTab = memo(({
    productName,
    description,
}: {
    productName: string;
    description?: string;
}) => (
    <motion.div
        className="prose prose-gray max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
        <div className="space-y-4 text-gray-600 leading-relaxed">
            {description ? (
                <p>{description}</p>
            ) : (
                <>
                    <p>
                        The <strong>{productName}</strong> bedding set is specially designed for young children,
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
                </>
            )}
        </div>
    </motion.div>
));

DescriptionTab.displayName = 'DescriptionTab';

const SpecsTab = memo(({ specs }: { specs: ProductSpec[] }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
        <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {specs.map((spec, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
                >
                    <span className="font-medium text-gray-700">{spec.label}</span>
                    <span className="font-semibold text-gray-900">{spec.value}</span>
                </motion.div>
            ))}
        </div>
    </motion.div>
));

SpecsTab.displayName = 'SpecsTab';

const ReviewsTab = memo(({
    reviews,
    averageRating
}: {
    reviews: Review[];
    averageRating: number;
}) => (
    <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
        {/* Reviews Summary */}
        <ReviewsSummary reviews={reviews} averageRating={averageRating} />

        {/* Reviews List */}
        <div className="space-y-4">
            {reviews.map((review, index) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                    <ReviewCard review={review} />
                </motion.div>
            ))}
        </div>

        {/* Load More */}
        <div className="text-center">
            <Button variant="outline" className="px-8">
                Load More Reviews
            </Button>
        </div>
    </motion.div>
));

ReviewsTab.displayName = 'ReviewsTab';
