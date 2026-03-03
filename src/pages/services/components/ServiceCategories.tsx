import { motion } from "framer-motion";
import { serviceCategories } from "../data";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ServiceCategories() {
  return (
    <section id="services" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-primary mb-2">
            Our Cleaning Services
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto">
            From bedding to car seats, we handle everything your baby touches —
            with 100% organic, baby-safe solutions.
          </p>
        </div>

        {/* Service Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.type}
                variants={cardVariants}
                className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-white text-primary border border-blue-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-[var(--color-blue-dark)]">
                        {cat.title}
                      </h3>
                      <span className="text-xs font-medium text-primary bg-white px-2 py-0.5 rounded-full border border-blue-200">
                        From {cat.priceFrom}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
