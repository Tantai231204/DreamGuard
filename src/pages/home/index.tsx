import HeroCarousel from "./components/HeroCarousel";
import NewsletterSection from "./components/NewsletterSection";
import ProductSection from "./components/ProductSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CategorySection from "./components/CategorySection";
import ReasonsSection from "./components/ReasonsSection";
import TradeInSection from "./components/TradeInSection";
import CleaningServicesSection from "./components/CleaningServicesSection";


export default function Home() {
    return (
        <>
            <HeroCarousel />
            <CategorySection />
            <ProductSection />
            <TradeInSection />
            <CleaningServicesSection />
            <ReasonsSection />
            <TestimonialsSection />
            <NewsletterSection />
        </>
    );
}