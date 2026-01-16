interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}

export default function PricingCard({ name, price, features, featured = false }: PricingCardProps) {
  return (
    <div
      className={`bg-white border border-dashed rounded-xl p-6 transition-all duration-300 ${
        featured
          ? "border-[var(--color-cleaning-featured-border)] shadow-lg scale-[1.02] relative"
          : "border-[var(--color-cleaning-border)] hover:shadow-md"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-cleaning-featured-border)] text-white text-xs px-4 py-1 rounded-full font-medium">
          Popular
        </div>
      )}
      
      <h3 className="text-base font-semibold text-[var(--color-cleaning-package-title)] mb-2">
        {name}
      </h3>
      
      <p className="text-2xl font-bold text-[var(--color-cleaning-price)] mb-5">
        {price} <span className="text-sm font-normal text-gray-500">/ Time</span>
      </p>
      
      <ul className="space-y-2 mb-6 min-h-[120px]">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-start text-xs text-[var(--color-cleaning-feature-list)]"
          >
            <span className="text-[var(--color-cleaning-featured-border)] mr-2 font-bold">•</span>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        className={`w-full py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
          featured
            ? "bg-[var(--color-cleaning-featured-border)] text-white hover:bg-opacity-90 hover:shadow-md"
            : "bg-[var(--color-cleaning-booking-btn)] text-[var(--color-cleaning-booking-text)] hover:opacity-90"
        }`}
      >
        Booking now
      </button>
    </div>
  );
}
