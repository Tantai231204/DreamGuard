import { useMemo } from "react"
import { useCategories } from "@/hooks/queries/useCategory"
import { usePublicCombos } from "@/hooks/queries/useCombo"
import { AppRoute } from "@/lib/constants"
import type { DropdownLink, HighlightCard } from "./NavDropdown"
import type { CategoryResponse } from "@/api/types/category.types"

export type NavItem = {
    label: string
    href?: string
    items?: DropdownLink[]
    highlight?: HighlightCard
    isSimpleMenu?: boolean
    categoryId?: number
    categoryName?: string
}

const MATERIAL_ASSETS: Record<string, { image: string, description: string }> = {
    'Polyester': {
        image: 'https://i.pinimg.com/1200x/16/67/bd/1667bd49ceb38179d8b9071842fd7bd0.jpg',
        description: 'Durable, lightweight and wrinkle-resistant.',
    },
    'Cotton': {
        image: 'https://i.pinimg.com/1200x/91/4e/cc/914eccc7214c72e9bea452fd1d536c72.jpg',
        description: 'Soft, breathable and perfect for everyday comfort.',
    },
    'Organic Cotton': {
        image: 'https://i.pinimg.com/1200x/56/ce/81/56ce813f1037f4f7d978c2d7f362adf3.jpg',
        description: '100% organic, hypoallergenic and eco-friendly.',
    },
    'Bamboo Fiber': {
        image: 'https://i.pinimg.com/736x/01/95/44/0195446c9411868e9efe734ef4b5151b.jpg',
        description: 'Naturally antibacterial and highly absorbent.',
    },
    'Fleece': {
        image: 'https://i.pinimg.com/736x/91/7e/86/917e8695f0744371d42e59ef0081c7d3.jpg',
        description: 'Warm, cozy, and ideal for chilly nights.',
    },
    'Memory Foam': {
        image: 'https://i.pinimg.com/736x/40/9f/88/409f887e5436ee1c5d6f0739b08bbf04.jpg',
        description: 'Contouring support that adapts to your shape.',
    },
    'default': {
        image: 'https://i.pinimg.com/736x/1a/10/7b/1a107b22d1406d44bcab4affb42fa023.jpg',
        description: 'High-quality material selected for best experience.',
    }
}

export function useHeaderData() {
    const { data: categories = [] } = useCategories()
    const { data: comboPage } = usePublicCombos({ pageSize: 12 })
    const combos = comboPage?.items || []

    const navItems = useMemo(() => {
        const topCategories = categories.slice(0, 3);
        const restCategories = categories.slice(3);

        const items: NavItem[] = topCategories.map((cat: CategoryResponse) => {
            const childItems: DropdownLink[] = (cat.childCategoryList || []).map(child => {
                const asset = MATERIAL_ASSETS[child.name] || MATERIAL_ASSETS['default'];
                return {
                    label: child.name,
                    href: `/products?cateId=${child.cateId}&categoryName=${encodeURIComponent(cat.name)}&materialName=${encodeURIComponent(child.name)}`,
                    image: asset.image,
                    description: asset.description
                };
            });

            return {
                label: cat.name,
                items: childItems,
                highlight: {
                    title: `Shop ${cat.name}`,
                    description: "Discover our premium quality collection.",
                    ctaLabel: "Shop Now",
                    href: `/products?cateId=${cat.cateId}`,
                    image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
                },
                categoryId: cat.cateId,
                categoryName: cat.name
            }
        });

        if (restCategories.length > 0) {
            const restDropdownItems: DropdownLink[] = restCategories.map((cat: CategoryResponse) => {
                const asset = MATERIAL_ASSETS[cat.name] || MATERIAL_ASSETS['default'];
                return {
                    label: cat.name,
                    href: `/products?cateId=${cat.cateId}`,
                    description: `Explore our collection of ${cat.name}`,
                    image: asset.image
                };
            });

            items.push({
                label: "Collections",
                items: restDropdownItems,
                isSimpleMenu: false,
                highlight: {
                    title: "Special Collections",
                    description: "Discover our full range of curated products.",
                    ctaLabel: "Shop All",
                    href: "/products",
                    image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
                }
            });
        }

        items.push({ label: "Combos", href: AppRoute.COMBOS });
        items.push({ label: "Services", href: "/services" });
        items.push({ label: "About", href: "/about" });

        return items;
    }, [categories]);

    return { navItems, combos };
}
