import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { trustStats } from "../data";

interface ServiceHeroProps {
  onClickBook: () => void;
}

export default function ServiceHero({ onClickBook }: ServiceHeroProps) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-primary mb-2">
            Cleaning Services
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto">
            Professional bedding cleaning service, protecting your baby's health with modern technology.
          </p>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-8 mb-10"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Protect Your Baby's Health{" "}
                <span className="text-primary">Every Day</span>
              </h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Professional cleaning for bedding, mattresses, strollers, car
                seats & toys. 100% organic solutions that eliminate 99.9% of
                bacteria — completely safe for your little one.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onClickBook}
                  className="inline-flex items-center gap-2 bg-[#4988c4] text-white font-medium px-6 py-2.5 rounded-full hover:bg-[#3a73a8] shadow-md shadow-[#4988c4]/10 transition-all text-sm cursor-pointer"
                >
                  Book Now
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 bg-white text-gray-700 font-medium px-6 py-2.5 rounded-full hover:bg-gray-50 transition-all border border-gray-200 text-sm cursor-pointer"
                >
                  View Services
                </button>
              </div>
            </div>

            {/* Right - Trust Stats */}
            <div className="grid grid-cols-2 gap-3">
              {trustStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white border border-dashed border-blue-300 rounded-lg p-4 text-center hover:shadow-sm transition-all"
                  >
                    <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
