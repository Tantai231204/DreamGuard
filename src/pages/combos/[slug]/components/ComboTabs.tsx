import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import { FormattedDescription } from '@/components/common/FormattedDescription';
import type { Combo } from '../../types';

interface ComboTabsProps {
    combo: Combo;
}

type TabType = 'description' | 'reviews';
const TAB_ORDER: TabType[] = ['description', 'reviews'];

export const ComboTabs = memo(({ combo }: ComboTabsProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const prevTabRef = useRef<TabType>(activeTab);
    const [direction, setDirection] = useState(0);

    const handleTabChange = (nextTab: string) => {
        const nextTabIndex = TAB_ORDER.indexOf(nextTab as TabType);
        const prevTabIndex = TAB_ORDER.indexOf(prevTabRef.current);

        setDirection(nextTabIndex > prevTabIndex ? 1 : -1);
        prevTabRef.current = nextTab as TabType;
        setActiveTab(nextTab as TabType);
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
                                {tab === 'description' ? 'Description' : `Reviews (0)`}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="relative min-h-[200px]">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: direction * 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -direction * 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TabsContent value="description" className="mt-0 outline-none">
                                <div className="max-w-3xl text-slate-600 font-medium italic">
                                    <FormattedDescription 
                                        content={combo.description}
                                        className="text-sm"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-0 outline-none">
                                <div className="text-center py-20">
                                    <Star className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No reviews for this bundle yet</p>
                                </div>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Tabs>
        </section>
    );
});

ComboTabs.displayName = 'ComboTabs';
