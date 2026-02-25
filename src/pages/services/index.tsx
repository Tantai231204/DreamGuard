import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Wrench } from "lucide-react";
import {
  ServiceHero,
  ServiceCategories,
  ProcessSteps,
  PricingSection,
  PackageBooking,
  CustomBookingForm,
} from "./components";
import type { BookingFlow } from "./types";

export default function ServicesPage() {
  const [flow, setFlow] = useState<BookingFlow>("package");
  const [selectedPackageId, setSelectedPackageId] = useState<string>();

  /* When user clicks "Book This Package" in PricingSection */
  const handleSelectPackage = useCallback((pkgId: string) => {
    setSelectedPackageId(pkgId);
    setFlow("package");
    /* scroll to booking section */
    requestAnimationFrame(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <ServiceHero />

      {/* Service Categories */}
      <ServiceCategories />

      {/* Process */}
      <ProcessSteps />

      {/* Pricing / Package overview */}
      <PricingSection onSelectPackage={handleSelectPackage} />

      {/* ===== Booking Section with Flow Toggle ===== */}
      <section id="booking" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-sm font-semibold tracking-wider uppercase text-[var(--color-primary)]">
              Book Now
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-3 mb-4 text-gray-900">
              Schedule Your Service
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose a ready-made package for convenience, or build your own
              custom order.
            </p>
          </motion.div>

          {/* Flow toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-2xl bg-gray-100 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setFlow("package")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  flow === "package"
                    ? "bg-white text-[var(--color-primary)] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Package className="h-4 w-4" />
                Package Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlow("custom");
                  setSelectedPackageId(undefined);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  flow === "custom"
                    ? "bg-white text-[var(--color-primary)] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Wrench className="h-4 w-4" />
                Custom Booking
              </button>
            </div>
          </div>

          {/* Active flow */}
          {flow === "package" ? (
            <PackageBooking
              key={selectedPackageId ?? "pkg"}
              initialPackageId={selectedPackageId}
            />
          ) : (
            <CustomBookingForm key="custom" />
          )}
        </div>
      </section>
    </div>
  );
}

export function Services() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Services</h1>
        <p className="mt-4 text-lg text-gray-600">
          Our services are coming soon.
        </p>
      </div>
    </div>
  );
}
