import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ServiceCard from "./cleaning/ServiceCard";
import LaundryProcess from "./cleaning/LaundryProcess";
import PricingCard from "./cleaning/PricingCard";
import { services, processes, packages } from "./cleaning/servicesData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CleaningServicesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".anim-header", {
                scrollTrigger: {
                    trigger: ".anim-header",
                    start: "top 85%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            gsap.from(".anim-service-card", {
                scrollTrigger: {
                    trigger: ".anim-services-container",
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out"
            });

            gsap.from(".anim-process", {
                scrollTrigger: {
                    trigger: ".anim-process",
                    start: "top 80%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });

            gsap.from(".anim-pricing-card", {
                scrollTrigger: {
                    trigger: ".anim-pricing-container",
                    start: "top 80%",
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="anim-header text-center mb-10">
                    <h2 className="text-3xl font-semibold text-primary mb-2">
                        Cleaning services
                    </h2>
                    <p className="text-sm text-gray-700 max-w-3xl mx-auto mb-3">
                        Professional bedding cleaning service, protecting your baby's health with modern technology.
                    </p>
                    <Link
                        to="/services"
                        className="inline-block text-xs text-primary font-medium hover:underline"
                    >
                        View all services →
                    </Link>
                </div>

                {/* Service Features */}
                <div className="anim-services-container grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                    {services.map((service, index) => (
                        <div key={index} className="anim-service-card h-full">
                            <ServiceCard {...service} />
                        </div>
                    ))}
                </div>

                {/* Professional Laundry Process */}
                <div className="anim-process mb-12">
                    <LaundryProcess processes={processes} />
                </div>

                {/* Pricing Packages */}
                <div className="anim-pricing-container grid grid-cols-1 md:grid-cols-3 gap-5">
                    {packages.map((pkg, index) => (
                        <div key={index} className="anim-pricing-card h-full">
                            <PricingCard {...pkg} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
