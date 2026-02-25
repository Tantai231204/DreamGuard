import { motion } from "framer-motion";
import { serviceCategories } from "../data";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServiceCategories() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-[var(--color-primary)]">
            What We Clean
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-3 mb-4 text-gray-900">
            Our Cleaning Services
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From bedding to car seats, we handle everything your baby touches —
            with 100% organic, baby-safe solutions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.type}
                variants={cardVariants}
                className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-semibold text-[var(--color-primary)] px-3 py-1 rounded-full">
                    From {cat.priceFrom}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
