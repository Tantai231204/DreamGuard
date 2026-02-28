import { useState, useCallback } from "react";
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
      <section id="booking" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-primary mb-2">
              Schedule Your Service
            </h2>
            <p className="text-sm text-gray-700 max-w-3xl mx-auto">
              Choose a ready-made package for convenience, or build your own
              custom order.
            </p>
          </div>

          {/* Flow toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-blue-50 border border-dashed border-blue-300 p-1 gap-1">
              <button
                type="button"
                onClick={() => setFlow("package")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  flow === "package"
                    ? "bg-white text-primary shadow-sm border border-blue-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Package Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlow("custom");
                  setSelectedPackageId(undefined);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  flow === "custom"
                    ? "bg-white text-primary shadow-sm border border-blue-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                Custom Booking
              </button>
            </div>
          </div>

          {/* Active flow */}
          <div className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-6">
            {flow === "package" ? (
              <PackageBooking
                key={selectedPackageId ?? "pkg"}
                initialPackageId={selectedPackageId}
              />
            ) : (
              <CustomBookingForm key="custom" />
            )}
          </div>
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
