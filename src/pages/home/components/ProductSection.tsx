import * as Tabs from '@radix-ui/react-tabs'
import ProductTabs from './products/ProductTabs'
import ProductGrid from './products/ProductGrid'
import { useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCategories } from '@/hooks/queries/useCategory'
import { useQueries } from '@tanstack/react-query'
import { productKeys } from '@/hooks/queries/useProduct'
import { productService } from '@/api'
import { mapToProduct, type ProductExtended } from '../../products/utils'
import { AppRoute } from '@/lib/constants'
import type { ProductResponse } from '@/api/types/product.types'

gsap.registerPlugin(ScrollTrigger)

export default function ProductSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const { data: categories = [] } = useCategories()

    // Flatten all category IDs (including children) to ensure we fetch everything
    const allCategoryIds = useMemo(() => {
        const ids = new Set<number>();
        categories.forEach(cat => {
            ids.add(cat.cateId);
            cat.childCategoryList?.forEach(child => ids.add(child.cateId));
        });
        return Array.from(ids);
    }, [categories]);

    // Fetch products from all categories in parallel
    const allCategoryQueries = useQueries({
        queries: allCategoryIds.map(id => ({
            queryKey: productKeys.byFilter({ cateId: id, pageSize: 10 }),
            queryFn: () => productService.getByFilter({ cateId: id, pageSize: 10 }),
            staleTime: 5 * 60 * 1000,
            enabled: allCategoryIds.length > 0,
        }))
    });

    const isLoading = allCategoryQueries.some(q => q.isLoading) || categories.length === 0;

    const allProducts: ProductExtended[] = useMemo(() => {
        const merged = allCategoryQueries.flatMap(q => {
            const data = q.data;
            if (!data) return [];
            if (Array.isArray(data)) return data;
            const responseObj = data as unknown as { items?: unknown[] };
            return (responseObj?.items || []) as ProductResponse[];
        });

        // Deduplicate by ID
        const seen = new Set<string>();
        const unique = merged.filter(p => {
            if (!p?.id || seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });

        return unique.map(mapToProduct);
    }, [allCategoryQueries]);

    // Split products for tabs - 3 items per tab
    const featuredProducts = useMemo(() => allProducts.slice(0, 3), [allProducts]);
    const bestsellers = useMemo(() => [...allProducts].sort((a: ProductExtended, b: ProductExtended) => (b.rating || 0) - (a.rating || 0)).slice(0, 3), [allProducts]);
    const newArrivals = useMemo(() => [...allProducts].sort((a: ProductExtended, b: ProductExtended) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 3), [allProducts]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".anim-title", {
                scrollTrigger: {
                    trigger: ".anim-title",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            gsap.from(".anim-content", {
                scrollTrigger: {
                    trigger: ".anim-content",
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: 0.2
            });
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-12 md:py-16 bg-[var(--color-primary-light)]/20">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Title */}
                <h2 className="anim-title text-xl md:text-2xl font-bold text-center text-primary mb-6">
                    Top picks for your little ones
                </h2>

                <div className="anim-content">
                    {/* Tabs */}
                    <Tabs.Root defaultValue="featured" className="w-full">
                        <ProductTabs className="mb-8" />

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                        ) : (
                            <>
                                <Tabs.Content value="featured" className="focus:outline-none">
                                    <ProductGrid products={featuredProducts} />
                                </Tabs.Content>
                                <Tabs.Content value="bestseller" className="focus:outline-none">
                                    <ProductGrid products={bestsellers} />
                                </Tabs.Content>
                                <Tabs.Content value="newarrivals" className="focus:outline-none">
                                    <ProductGrid products={newArrivals} />
                                </Tabs.Content>
                            </>
                        )}
                    </Tabs.Root>

                    {/* See More Button */}
                    <div className="flex justify-center mt-12">
                        <Link
                            to={AppRoute.PRODUCTS}
                            className="group relative px-12 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-black hover:shadow-2xl hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10">SEE ALL PRODUCTS</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
