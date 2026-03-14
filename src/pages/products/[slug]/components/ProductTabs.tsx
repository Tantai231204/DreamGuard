import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReviewCard } from './ReviewCard';
import { ReviewsSummary } from './ReviewsSummary';
import type { TabType, ProductSpec, Review } from '../types';

interface ProductTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    productName: string;
    description?: string | null;
    specs: ProductSpec[];
    reviews: Review[];
    averageRating: number;
}

const TAB_ORDER: TabType[] = ['description', 'specs', 'reviews'];

export const ProductTabs = memo(({
    activeTab,
    onTabChange,
    productName,
    description,
    specs,
    reviews,
    averageRating
}: ProductTabsProps) => {
    const prevTabRef = useRef<TabType>(activeTab);
    const [direction, setDirection] = useState(0);

    const handleTabChange = (nextTab: string) => {
        const nextTabIndex = TAB_ORDER.indexOf(nextTab as TabType);
        const prevTabIndex = TAB_ORDER.indexOf(prevTabRef.current);

        setDirection(nextTabIndex > prevTabIndex ? 1 : -1);
        prevTabRef.current = nextTab as TabType;
        onTabChange(nextTab as TabType);
    };

    return (
        <section className="mt-24">
            <Tabs
                defaultValue="description"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <div className="border-b border-slate-100 mb-12">
                    <TabsList className="bg-transparent h-auto p-0 gap-10">
                        {TAB_ORDER.map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 data-[state=active]:text-slate-900 transition-all font-inter"
                            >
                                {tab === 'description' ? 'Description' :
                                    tab === 'specs' ? 'Specifications' :
                                        `Reviews (${reviews.length})`}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: direction * 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -direction * 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TabsContent value="description" className="mt-0 outline-none">
                                <div className="max-w-3xl prose prose-sm prose-slate leading-relaxed text-slate-600 italic font-medium">
                                    {description ? (
                                        <div dangerouslySetInnerHTML={{ __html: description }} />
                                    ) : (
                                        <p>The {productName} offers premium comfort and quality, expertly crafted to ensure the best experience for your little one. Made from 100% organic materials with sustainability in mind.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="specs" className="mt-0 outline-none">
                                <div className="max-w-2xl divide-y divide-slate-100 border-y border-slate-100">
                                    {specs.map((spec, index) => (
                                        <div key={index} className="flex py-4 justify-between items-center group">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{spec.label}</span>
                                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-0 outline-none">
                                <div className="space-y-12">
                                    <ReviewsSummary reviews={reviews} averageRating={averageRating} />
                                    <div className="grid gap-8">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <ReviewCard key={review.id} review={review} />
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-slate-300 text-[10px] font-black uppercase tracking-widest">No reviews yet</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Tabs>
        </section>
    );
});

ProductTabs.displayName = 'ProductTabs';
