import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewsSummary } from './ReviewsSummary';
import { FormattedDescription } from '@/components/common/FormattedDescription';
import type { TabType, ProductSpec, Review } from '../types';

interface ProductTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    productName: string;
    description?: string | null;
    summary?: string | null;
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
    summary,
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
                <div className="border-b border-slate-100 mb-12 relative">
                    <TabsList className="bg-transparent h-auto p-0 gap-10 relative">
                        {TAB_ORDER.map((tab) => {
                            const isActive = activeTab === tab;

                            return (
                                <div key={tab} className="relative flex-1 w-full flex flex-col items-center">
                                    <TabsTrigger
                                        value={tab}
                                        className={`
            relative px-0 ${tab === 'reviews' ? 'py-2 text-[9px] min-w-[80px]' : 'py-4 text-[10px]'} font-black uppercase tracking-widest font-inter
            transition-colors duration-300 border-none
            ${isActive ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}
          `}
                                        style={{ zIndex: 2, background: 'none' }}
                                    >
                                        {tab === 'description'
                                            ? 'Description'
                                            : tab === 'specs'
                                                ? 'Specifications'
                                                : `Reviews (${reviews.length})`}
                                    </TabsTrigger>

                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-900 rounded-full"
                                            style={{ zIndex: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 420,
                                                damping: 30,
                                                mass: 0.7,
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
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
                                {/* ── Summary & Description Content ── */}
                                <div className="space-y-4">
                                    {summary && (
                                        <div className="relative group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-px w-8 bg-slate-900" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Abstract</span>
                                            </div>
                                            <p className="text-[15px] sm:text-[16px] font-medium text-slate-900 leading-[1.6] tracking-tight font-outfit max-w-4xl">
                                                {summary}
                                            </p>
                                        </div>
                                    )}
                                    <div className="pt-0">
                                        {description ? (
                                            <FormattedDescription
                                                content={description}
                                                className="font-outfit"
                                            />
                                        ) : (
                                            <div className="space-y-8 text-slate-400 font-medium italic text-[16px] leading-relaxed max-w-3xl">
                                                <p>Experience the pinnacle of sleep luxury with the {productName}. Every detail is meticulously crafted to provide unparalleled comfort and support, ensuring your little one enjoys the most peaceful rest possible.</p>
                                                <p>Our commitment to quality means using only the finest sustainable materials, rigorously tested for safety and durability. It's not just a product; it's an investment in your family's well-being.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Highlight Callout ── */}
                                <div className="mt-10 flex items-start gap-6 p-8 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                                        <Sparkles className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Craftsmanship Highlight</h5>
                                        <p className="text-[14px] text-slate-500 leading-relaxed italic max-w-2xl">
                                            "Design is not just what it looks like and feels like. Design is how it works." In the crafting of {productName}, we've prioritized ergonomic support and hypoallergenic properties to create a sanctuary of rest.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specs" className="mt-0 outline-none">
                                <div className="w-full divide-y divide-slate-100 border-y border-slate-100">
                                    {specs.map((spec, index) => (
                                        <div key={index} className="flex py-6 justify-between items-center group transition-colors hover:bg-slate-50/50 px-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 transition-colors">{spec.label}</span>
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
