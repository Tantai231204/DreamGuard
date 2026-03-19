import { useState } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { PackageBooking } from "./components";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppRoute } from "@/lib/constants";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pkgId = searchParams.get("packageId") || undefined;

  const [selectedPackageId] = useState<string | undefined>(pkgId);

  return (
    <div className="min-h-screen bg-slate-50/50 animate-in fade-in duration-300">
      {/* Sharp Modern Header like Checkout */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="container mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate(AppRoute.SERVICES)}
              className="group h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w -3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Return</span>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 leading-none">Booking Services</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-100 bg-white">
              <Lock className="w-3 h-3 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SSL Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outer Main Container */}
      <main className="container mx-auto max-w-[1200px] px-6 py-6 border-slate-50">
        {/* Main heading and assurance cards */}
        <div className="max-w-xl space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-slate-900 text-white shadow-md shadow-slate-200">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Guaranteed Cleanup</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">
            Reserve your slot <span className="text-[#4988c4]">DreamGuard Expert sizing.</span>
          </h2>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <PackageBooking key={selectedPackageId ?? "pkg"} initialPackageId={selectedPackageId} />
        </div>
      </main>
    </div>
  );
}
