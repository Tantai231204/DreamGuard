import { AppRoute } from "@/lib/constants"

export interface SlideData {
    tag: string
    title: string
    highlight: string
    description: string
    image: string
    cta: string
    bgFrom: string
    bgTo: string
    href: string
    secondaryHref?: string
}

export const SLIDES: SlideData[] = [
    {
        tag: "Premium Bedding",
        title: "Celestial Dreams for",
        highlight: "Your Little One",
        description: "Crafted with 100% organic cotton and celestial love to ensure the deepest sleep for your baby.",
        image: "https://i.pinimg.com/736x/07/63/00/076300f1087732f038d5b567b547678e.jpg",
        cta: "Explore Collection",
        bgFrom: "#1e3a5f",
        bgTo: "#4988c4",
        href: AppRoute.PRODUCTS,
        secondaryHref: AppRoute.COMBOS
    },
    {
        tag: "Safety Certified",
        title: "Breathable Care in",
        highlight: "Every Fiber",
        description: "Our engineered bamboo fabric provides 3x more airflow than traditional cotton blankets.",
        image: "https://i.pinimg.com/736x/cf/85/47/cf8547e34d357ed2880084227443c13d.jpg",
        cta: "Shop Essentials",
        bgFrom: "#3a73a8",
        bgTo: "#5bc4dc",
        href: AppRoute.PRODUCTS,
        secondaryHref: AppRoute.ABOUT
    },
    {
        tag: "Eco-Friendly",
        title: "Nature's Embrace for",
        highlight: "Sweetest Sleep",
        description: "Hypoallergenic materials sourced responsibly to protect both your baby and our planet.",
        image: "https://i.pinimg.com/1200x/e7/60/89/e76089183b4a3632a85646b274a50325.jpg",
        cta: "View Collection",
        bgFrom: "#4988c4",
        bgTo: "#74a4b0",
        href: AppRoute.PRODUCTS,
        secondaryHref: AppRoute.SERVICES_CUSTOMIZE
    },
]

export const MOTION_CONFIG = {
    ease: [0.22, 1, 0.36, 1] as const, // Classic Premium Ease
    contentDelay: 0.5,
    sCurvePath: 'M 0,50 C 15,10 35,10 50,50 C 65,90 85,90 100,50',
}
