import * as Tabs from '@radix-ui/react-tabs'
import { products } from './products/productData'
import ProductTabs from './products/ProductTabs'
import ProductGrid from './products/ProductGrid'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ProductSection() {
    const sectionRef = useRef<HTMLElement>(null)

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
                    <div className="flex justify-center mt-8">
                        <button className="px-10 py-2.5 bg-[var(--color-primary-light)] text-black rounded-full text-xs font-semibold hover:bg-[var(--color-primary-light)]/90 transition-colors duration-300 shadow-md hover:shadow-lg">
                            SEE MORE
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
