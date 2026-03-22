import { useCallback } from "react";
import {
  ServiceHero,
  ServiceCategories,
  ProcessSteps,
  PricingSection,
  CustomizeSection,
} from "./components";

import { useNavigate } from "react-router-dom";
import { AppRoute } from "@/lib/constants";

export default function ServicesPage() {
  const navigate = useNavigate();

  const handleSelectPackage = useCallback(() => {
    navigate(AppRoute.SERVICES_BOOKING);
  }, [navigate]);

  const handleStartBooking = useCallback(() => {
    navigate(AppRoute.SERVICES_BOOKING);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with click triggers */}
      <ServiceHero onClickBook={handleStartBooking} />

      {/* 3D Customize Section (New Entry Point) */}
      <CustomizeSection />

      {/* Service Categories */}
      <ServiceCategories />

      {/* Process */}
      <ProcessSteps />

      {/* Pricing / Package overview */}
      <PricingSection onSelectPackage={handleSelectPackage} />


    </div>
  );
}
