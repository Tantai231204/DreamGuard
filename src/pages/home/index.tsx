import HeroCarousel from "./components/HeroCarousel";
import NewsletterSection from "./components/NewsletterSection";
import ProductSection from "./components/ProductSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ReasonsSection from "./components/ReasonsSection";
import CleaningServicesSection from "./components/CleaningServicesSection";


export default function Home() {
    return (
        <>
            <HeroCarousel />
            <ProductSection />
            <CleaningServicesSection />
            <ReasonsSection />
            <TestimonialsSection />
            <NewsletterSection />
        </>
    );
}   