import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { trustStats } from "../data";

export default function ServiceHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-blue-600 to-indigo-700 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Professional Baby Item Cleaning
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Protect Your Baby&apos;s Health{" "}
              <span className="text-yellow-300">Every Day</span>
            </h1>

            <p className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed">
              Professional cleaning for bedding, mattresses, strollers, car
              seats & toys. 100% organic solutions that eliminate 99.9% of
              bacteria — completely safe for your little one.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#booking"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold px-8 py-4 rounded-full hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Book Now
                <ArrowDown className="h-5 w-5 animate-bounce" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all"
              >
                View Services
              </a>
            </div>
          </motion.div>

          {/* Right — Trust Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {trustStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Icon className="h-8 w-8 text-yellow-300 mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path
            d="M0 80V30C240 60 480 0 720 30C960 60 1200 0 1440 30V80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
