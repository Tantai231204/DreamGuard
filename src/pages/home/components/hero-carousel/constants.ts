export interface SlideData {
    tag: string
    title: string
    highlight: string
    description: string
    image: string
    cta: string
    bgFrom: string
    bgTo: string
}

export const SLIDES: SlideData[] = [
    {
        tag: "Premium Bedding",
        title: "Celestial Dreams for",
        highlight: "Your Little One",
        description: "Crafted with 100% organic cotton and celestial love to ensure the deepest sleep for your baby.",
        image: "https://i.pinimg.com/736x/8a/6f/c5/8a6fc5992477605477627ab85b592643.jpg",
        cta: "Explore Collection",
        bgFrom: "#1e3a5f",
        bgTo: "#4988c4"
    },
    {
        tag: "Safety First",
        title: "Breathable Care in",
        highlight: "Every Fiber",
        description: "Our engineered bamboo fabric provides 3x more airflow than traditional cotton blankets.",
        image: "https://i.pinimg.com/736x/87/dc/87/87dc87d26f322c96355eb8230c877079.jpg",
        cta: "Shop Essentials",
        bgFrom: "#3a73a8",
        bgTo: "#5bc4dc"
    },
    {
        tag: "Eco-Friendly",
        title: "Nature's Embrace for",
        highlight: "Sweetest Sleep",
        description: "Hypoallergenic materials sourced responsibly to protect both your baby and our planet.",
        image: "https://i.pinimg.com/1200x/4d/d5/3a/4dd53acde9ca605a135c9f2be3f55b53.jpg",
        cta: "Join Green Movement",
        bgFrom: "#4988c4",
        bgTo: "#74a4b0"
    },
]

export const MOTION_CONFIG = {
    ease: [0.22, 1, 0.36, 1] as const, // Classic Premium Ease
    contentDelay: 0.5,
    sCurvePath: 'M 0,50 C 15,10 35,10 50,50 C 65,90 85,90 100,50',
}
