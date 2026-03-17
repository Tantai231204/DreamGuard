import { useCallback } from "react";
import { ArrowRight } from "lucide-react";
import {
  ServiceHero,
  ServiceCategories,
  ProcessSteps,
  PricingSection,
} from "./components";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import { AppRoute } from "@/lib/constants";

export default function ServicesPage() {
  const navigate = useNavigate();

  const handleSelectPackage = useCallback((pkgId: string) => {
    navigate(`${AppRoute.SERVICES_BOOKING}?packageId=${pkgId}`);
  }, [navigate]);

  const handleStartBooking = useCallback(() => {
    navigate(AppRoute.SERVICES_BOOKING);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with click triggers */}
      <ServiceHero onClickBook={handleStartBooking} />

      {/* Service Categories */}
      <ServiceCategories />

      {/* Process */}
      <ProcessSteps />

      {/* Pricing / Package overview */}
      <PricingSection onSelectPackage={handleSelectPackage} />

      {/* Trigger Bottom Button manual toggle for Booking flow explicitly */}
      <section className="py-16 text-center bg-slate-50 border-t border-slate-100">
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className="text-2xl font-black text-slate-900">Custom Scheduling?</h3>
          <p className="text-sm text-slate-400 font-medium">Build your order package breakdown setup tailored directly to your dimension needs pricing lists.</p>
          <Button 
            onClick={handleStartBooking}
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:to-[#2d5d8a] text-white shadow-xl shadow-[#4988c4]/20 font-black uppercase tracking-widest text-[10px] mt-4"
          >
            Start Booking Form <ArrowRight className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
