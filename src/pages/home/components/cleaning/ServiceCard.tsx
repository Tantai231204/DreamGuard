interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="bg-[var(--color-cleaning-feature-bg)] border border-dashed border-[var(--color-cleaning-border)] rounded-lg p-5 text-center">
      <h3 className="text-sm font-semibold text-[var(--color-cleaning-feature-title)] mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-cleaning-feature-text)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
