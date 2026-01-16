import * as Tabs from '@radix-ui/react-tabs'
import { products } from './products/productData'
import ProductTabs from './products/ProductTabs'
import ProductGrid from './products/ProductGrid'

export default function ProductSection() {
    return (
        <section className="py-12 md:py-16 bg-[var(--color-product-bg)]/20">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Title */}
                <h2 className="text-xl md:text-2xl font-bold text-center text-[var(--color-product-title)] mb-6">
                    Top picks for your little ones
                </h2>

                {/* Tabs */}
                <Tabs.Root defaultValue="featured" className="w-full">
                    <ProductTabs className="mb-8" />

                    <Tabs.Content value="featured" className="focus:outline-none">
                        <ProductGrid products={products} />
                    </Tabs.Content>
                    <Tabs.Content value="bestseller" className="focus:outline-none">
                        <ProductGrid products={products} />
                    </Tabs.Content>
                    <Tabs.Content value="newarrivals" className="focus:outline-none">
                        <ProductGrid products={products} />
                    </Tabs.Content>
                </Tabs.Root>

                {/* See More Button */}
                <div className="flex justify-center">
                    <button className="px-10 py-2.5 bg-[var(--color-product-tab-active)] text-black rounded-full text-xs font-semibold hover:bg-[var(--color-product-tab-active)]/90 transition-colors duration-300 shadow-md hover:shadow-lg">
                        SEE MORE
                    </button>
                </div>
            </div>
        </section>
    )
}
