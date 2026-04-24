import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Package, Layers, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useProductsByFilter } from '@/hooks/queries/useProduct'
import { usePublicCombos } from '@/hooks/queries/useCombo'
import { useCategories } from '@/hooks/queries/useCategory'
import { AppRoute } from '@/lib/constants'
import { useQueries } from '@tanstack/react-query'
import { productService } from '@/api'
import type { ProductResponse, ComboResponse, ProductVariantResponse, AdminProductPageResponse } from '@/api'

export function SearchBar() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query, 300)
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)

    // 1. Fetch all categories first
    const { data: categories = [] } = useCategories()

    // 2. Fetch products for each category in parallel
    const productQueries = useQueries({
        queries: categories.map(cat => ({
            queryKey: ['products', 'filter', { cateId: cat.cateId, pageSize: 50 }],
            queryFn: () => productService.getByFilter({ cateId: cat.cateId, pageSize: 50 }),
            staleTime: 5 * 60 * 1000,
            enabled: isOpen,
        }))
    })

    // 3. Also fetch by keyword directly
    const { data: keywordProducts = [], isLoading: isLoadingKeyword } = useProductsByFilter(
        { key: debouncedQuery, pageSize: 50 },
        debouncedQuery.length >= 2
    )

    // 4. Fetch Combos
    const { data: comboData, isLoading: isLoadingCombos } = usePublicCombos(
        { pageSize: 1000 },
        isOpen
    )

    // Flatten all products from category queries and keyword search
    const allProducts = useMemo(() => {
        const fromCategories = productQueries.flatMap(q => {
            const data = q.data;
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return (data as AdminProductPageResponse).items || [];
        });
        
        const fromKeyword = Array.isArray(keywordProducts) 
            ? keywordProducts 
            : (keywordProducts as AdminProductPageResponse).items || [];

        // Unique by ID
        const combined = [...fromCategories, ...fromKeyword];
        const seen = new Set();
        return combined.filter(item => {
            const product = item as ProductResponse;
            if (!product?.id || seen.has(product.id)) return false;
            seen.add(product.id);
            return true;
        }) as ProductResponse[];
    }, [productQueries, keywordProducts])

    // Client-side filtering for Products
    const filteredProducts = useMemo(() => {
        if (debouncedQuery.length < 2) return []
        const q = debouncedQuery.toLowerCase()
        return allProducts.filter(item => {
            return (
                item.name?.toLowerCase().includes(q) ||
                item.summary?.toLowerCase().includes(q) ||
                item.material?.toLowerCase().includes(q) ||
                item.categoryName?.toLowerCase().includes(q) ||
                item.variants?.some((v: ProductVariantResponse) => v.sku?.toLowerCase().includes(q))
            )
        }).slice(0, 6)
    }, [allProducts, debouncedQuery])

    // Client-side filtering for Combos
    const filteredCombos = useMemo(() => {
        if (debouncedQuery.length < 2) return []
        const q = debouncedQuery.toLowerCase()
        const combos = Array.isArray(comboData) ? comboData : (comboData as { items: ComboResponse[] })?.items || []
        
        return (combos as ComboResponse[]).filter(item => {
            return (
                item.name?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.color?.toLowerCase().includes(q) ||
                item.size?.toLowerCase().includes(q) ||
                item.sku?.toLowerCase().includes(q)
            )
        }).slice(0, 6)
    }, [comboData, debouncedQuery])

    const hasResults = filteredProducts.length > 0 || filteredCombos.length > 0
    const isLoading = isLoadingKeyword || isLoadingCombos || productQueries.some(q => q.isLoading)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return
        navigate(`${AppRoute.PRODUCTS}?q=${encodeURIComponent(query.trim())}`)
        setIsOpen(false)
    }

    const handleResultClick = (type: 'product' | 'combo', slug: string) => {
        navigate(type === 'product' ? `/products/${slug}` : `/combos/${slug}`)
        setIsOpen(false)
        setQuery('')
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-xs">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search mattresses, pillows, blankets..."
                    className="w-full h-10 pl-4 pr-12 rounded-full border border-slate-300 focus:outline-none focus:border-[#4988c4] transition-all bg-white text-sm"
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-[#4988c4] hover:bg-[#3b6ea0] transition-colors"
                >
                    <Search className="h-4 w-4 text-white" />
                </button>
                
                {query && (
                    <button 
                        type="button"
                        onClick={() => {
                            setQuery('')
                            setIsOpen(false)
                        }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </form>

            <AnimatePresence>
                {isOpen && (query.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[100] max-h-[480px] flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                            {/* Products Section */}
                            {filteredProducts.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Package className="w-3 h-3" />
                                        Products
                                    </div>
                                    <div className="grid gap-1">
                                        {filteredProducts.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleResultClick('product', item.slug)}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={item.imageUrls?.[0] || item.assets?.[0]?.url || '/images/placeholder.svg'} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#4988c4] transition-colors">{item.name}</h4>
                                                    <p className="text-[10px] text-slate-500 line-clamp-1">
                                                        {item.summary || item.categoryName || 'View details'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Combos Section */}
                            {filteredCombos.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Layers className="w-3 h-3" />
                                        Combos
                                    </div>
                                    <div className="grid gap-1">
                                        {filteredCombos.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleResultClick('combo', item.slug)}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[#4988c4]/10 overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={item.imageUrl || '/images/placeholder.svg'} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#4988c4] transition-colors">{item.name}</h4>
                                                    <p className="text-[10px] text-slate-500 line-clamp-1">
                                                        {item.description || item.category || 'Special bundle'}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-bold text-[#4988c4]">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice || 0)}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State / Loading */}
                            {!isLoading && !hasResults && (
                                <div className="py-8 text-center">
                                    <p className="text-xs font-bold text-slate-800">No results found</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Try another keyword</p>
                                </div>
                            )}

                            {isLoading && (
                                <div className="py-8 text-center">
                                    <div className="inline-block w-4 h-4 border-2 border-[#4988c4]/20 border-t-[#4988c4] rounded-full animate-spin" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Searching...</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        {hasResults && (
                            <button
                                onClick={() => handleSearch()}
                                className="p-3 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-center"
                            >
                                <span className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest">
                                    Explore all matching items
                                </span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
