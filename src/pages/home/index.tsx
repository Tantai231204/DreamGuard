import HeroCarousel from "../../components/home/HeroCarousel";
import NewsletterSection from "../../components/home/NewsletterSection";

export default function Home() {
    return (
        <>
            <HeroCarousel />
            <NewsletterSection />

            <div className="container mx-auto max-w-7xl px-4 py-16">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-foreground">
                        Premium Quality Products
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover our collection of mattresses and bedding products designed for your ultimate comfort.
                    </p>
                </div>
            </div>
        </>
    );
}