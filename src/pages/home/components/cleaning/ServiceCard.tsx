import { FormattedDescription } from '@/components/common/FormattedDescription';

interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-5 text-center">
      <h3 className="text-sm font-semibold text-[var(--color-blue-dark)] mb-1.5">
        {title}
      </h3>
      <FormattedDescription 
        content={description}
        className="text-xs text-gray-600 leading-relaxed"
      />
    </div>
  );
}
