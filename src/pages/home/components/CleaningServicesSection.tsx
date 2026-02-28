import { Link } from "react-router-dom";
import ServiceCard from "./cleaning/ServiceCard";
import LaundryProcess from "./cleaning/LaundryProcess";
import PricingCard from "./cleaning/PricingCard";
import { services, processes, packages } from "./cleaning/servicesData";

export default function CleaningServicesSection() {
    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>

                {/* Professional Laundry Process */}
                <div className="mb-12">
                    <LaundryProcess processes={processes} />
                </div>

                {/* Pricing Packages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {packages.map((pkg, index) => (
                        <PricingCard key={index} {...pkg} />
                    ))}
                </div>
            </div>
        </section>
    );
}

