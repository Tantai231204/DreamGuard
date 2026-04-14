import { motion, type TargetAndTransition, type VariantLabels, type Transition } from "framer-motion";
import { ArrowRight, Box, Palette, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AppRoute } from "@/lib/constants";
import { memo, useMemo } from "react";

// --- Types & Constants ---
interface FeatureProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  colorClass: string;
}

const BRAND_BLUE = "#4988c4";

// Animation Constants for Performance (Avoid inline objects)
const VIEWPORT_CONFIG = { once: true, margin: "-100px" };
const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// --- Sub-components ---
const FeatureItem = memo(({ icon: Icon, title, desc, colorClass }: FeatureProps) => (
  <div className="group space-y-3 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-2xl ${colorClass} transition-transform group-hover:scale-110 duration-500 will-change-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">{title}</h4>
    </div>
    <p className="text-[11px] text-slate-400 font-medium leading-relaxed pl-[44px]">
      {desc}
    </p>
  </div>
));

FeatureItem.displayName = "FeatureItem";

interface FloatingElementProps {
  src: string;
  className: string;
  animate: TargetAndTransition | VariantLabels;
  duration: number;
  delay?: number;
  initial?: TargetAndTransition | VariantLabels;
}

const FloatingElement = memo(({ src, className, animate, duration, delay = 0, initial }: FloatingElementProps) => {
  const transition = useMemo<Transition>(() => ({
    duration,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
    delay
  }), [duration, delay]);

  return (
    <motion.div
      className={`${className} will-change-transform pointer-events-none`}
      initial={initial || (animate && typeof animate === 'object' && !Array.isArray(animate) ? animate : {})}
      animate={animate}
      transition={transition}
      style={{ transform: "translateZ(0)" }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
});

FloatingElement.displayName = "FloatingElement";

// --- Main Component ---
export default function CustomizeSection() {
  const navigate = useNavigate();

  // Optimized animation variants for better FPS (Using simpler keyframes with "reverse")
  const cloudAnimate1 = useMemo(() => ({
    x: [0, 30],
    y: [0, -15],
    rotate: [0, 1]
  }), []);

  const cloudAnimate2 = useMemo(() => ({
    x: [0, -20],
    y: [0, 10],
  }), []);

  const featherAnimate1 = useMemo(() => ({
    y: [0, 20],
    rotate: [0, 10],
    x: [0, 8]
  }), []);

  const featherAnimate2 = useMemo(() => ({
    y: [0, -15],
    rotate: [0, -8],
    x: [0, -10]
  }), []);

  return (
    <section className="relative py-32 overflow-hidden bg-slate-50/30">
      {/* 1. Optimized Background Accents (Single Layer for performance) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_70%_50%,#E0F2FE_0%,transparent_50%)]"
      />

      {/* Decorative Assets - Clean & Deep (No laggy filters) */}
      <FloatingElement
        src="/images/clound.svg"
        className="absolute top-10 left-[5%] w-72 opacity-60 z-10"
        initial={{ x: 0, y: 0, rotate: 0 }}
        animate={cloudAnimate1}
        duration={20}
      />

      <div className="container mx-auto max-w-7xl px-8 relative z-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* --- Left Column: Narrative --- */}
          <div className="space-y-12">
            <div className="space-y-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                variants={FADE_UP_VARIANTS}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200/60 shadow-sm"
              >
                <div className="flex -space-x-2">
                  <img src="/images/pillow.svg" alt="" className="w-4 h-4 relative z-10" />
                  <Sparkles className="w-3.5 h-3.5 text-[#4988c4] relative z-20" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                  Premium <span className="text-[#4988c4]">3D Studio</span>
                </span>
              </motion.div>

              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                variants={FADE_UP_VARIANTS}
                className="text-5xl xl:text-6xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] uppercase"
              >
                Dream it. <br />
                <span className="text-[#4988c4]">Customize</span> it. <br />
                Sleep on it.
              </motion.h2>

              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                variants={FADE_UP_VARIANTS}
                className="text-slate-400 font-medium leading-relaxed max-w-md text-base tracking-tight"
              >
                Experience the first real-time 3D nursery studio. Personalize every stitch of your baby's sanctuary with unmatched precision.
              </motion.p>
            </div>

            {/* --- Features Grid --- */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <FeatureItem
                icon={Box}
                title="1:1 Models"
                desc="True-to-life scale bedding and crib sets."
                colorClass="bg-blue-50 text-blue-600"
              />
              <FeatureItem
                icon={Palette}
                title="Fabrics"
                desc="Curated organic materials & silk selections."
                colorClass="bg-primary-50 text-primary-600"
              />
              <FeatureItem
                icon={Type}
                title="Embroidery"
                desc="Personalized names with 3D thread effects."
                colorClass="bg-emerald-50 text-emerald-600"
              />
              <FeatureItem
                icon={Sparkles}
                title="Real-time"
                desc="Instant visual feedback from every angle."
                colorClass="bg-amber-50 text-amber-600"
              />
            </div>

            <Button
              onClick={() => navigate(AppRoute.SERVICES_CUSTOMIZE)}
              style={{ backgroundColor: BRAND_BLUE }}
              className="h-14 px-10 rounded-2xl text-white shadow-xl shadow-blue-500/10 hover:opacity-90 active:scale-95 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-4 group border-none"
            >
              Enter Studio
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3 w-3" />
              </div>
            </Button>
          </div>

          {/* --- Right Column: The "Hero Scene" --- */}
          <div className="relative flex justify-center items-center lg:pl-10">
            <div className="relative z-20 w-full max-w-[500px]">
              {/* Main Visual */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative will-change-transform"
              >
                <img
                  src="/images/pillow.svg"
                  alt="Baby Pillow"
                  loading="lazy"
                  className="w-full h-auto drop-shadow-2xl relative z-10"
                />

                {/* Premium Feathers (High Performance) */}
                <FloatingElement
                  src="/images/longvu.png"
                  className="absolute -top-16 -right-12 w-48 h-48 opacity-100 z-30"
                  initial={{ y: 0, rotate: 0, x: 0 }}
                  animate={featherAnimate1}
                  duration={5}
                />
                <FloatingElement
                  src="/images/longvu.png"
                  className="absolute bottom-0 -left-16 w-36 h-36 opacity-80 scale-x-[-1] z-30"
                  initial={{ y: 0, rotate: 0, x: 0 }}
                  animate={featherAnimate2}
                  duration={7}
                  delay={1}
                />
              </motion.div>

              {/* Design Overlay (Optimized Shadow) */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute -bottom-6 -right-10 z-40 p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col gap-4 min-w-[200px] will-change-transform"
              >
                <div className="flex gap-2">
                  {["#E0F2FE", "#4988c4", "#F1F5F9"].map((c) => (
                    <div key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="h-px bg-slate-100 w-full" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected Fabric</p>
                  <p className="text-xs font-black text-slate-900 tracking-tight">Double-Layer Organic Silk</p>
                </div>
              </motion.div>

              {/* Subtle Cloud Detail */}
              <FloatingElement
                src="/images/clound.svg"
                className="absolute -top-24 left-[-10%] z-0 w-56 opacity-70"
                initial={{ x: 0, y: 0 }}
                animate={cloudAnimate2}
                duration={8}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
