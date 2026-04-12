import { ShieldCheck, Award, Leaf, BadgeCheck, type LucideIcon } from 'lucide-react';

export interface CertificateStyle {
  icon?: LucideIcon;
  image?: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  isDefault?: boolean;
  // Metadata for the new UI
  defaultDescription?: string;
  organization?: string;
  scope?: string;
  coverageBars?: { label: string; value: number }[];
}

/**
 * Global registry for certificate assets and styles.
 * Replace 'image' paths with actual local assets or remote URLs.
 */
export const CERTIFICATE_REGISTRY: Record<string, CertificateStyle> = {
  'OEKO-TEX': {
    image: 'https://i.pinimg.com/1200x/c0/81/73/c081737127c8d924919f165d3e7629f7.jpg', // Placeholder
    icon: ShieldCheck,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    borderColor: 'border-emerald-100',
    organization: 'OEKO-TEX® Association',
    scope: 'International',
    defaultDescription: 'Tested for harmful substances and certified safe for baby skin.',
    coverageBars: [
      { label: 'Pesticides', value: 100 },
      { label: 'Heavy metals', value: 100 },
      { label: 'Allergens', value: 95 },
      { label: 'Toxic dyes', value: 100 },
    ]
  },
  'GOTS': {
    image: 'https://i.pinimg.com/1200x/61/da/02/61da02a6860be9816dcfbce06750f792.jpg', // Placeholder
    icon: Leaf,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-700',
    borderColor: 'border-green-100',
    organization: 'Global Organic Textile Standard',
    scope: 'Organic Worldwide',
    defaultDescription: 'The leading world standard for organic fibers, including ecological and social criteria.',
    coverageBars: [
      { label: 'Organic fiber', value: 95 },
      { label: 'Biodegradability', value: 100 },
      { label: 'Social Ethics', value: 90 },
      { label: 'Carbon footprint', value: 85 },
    ]
  },
  'CPSC': {
    image: 'https://i.pinimg.com/736x/90/06/a8/9006a864900694b4280de104de46be95.jpg', // Placeholder
    icon: Award,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    organization: 'U.S. Consumer Product Safety Commission',
    scope: 'USA Standard',
    defaultDescription: 'Meets rigorous US federal safety standards for children\'s products.',
    coverageBars: [
      { label: 'Lead content', value: 100 },
      { label: 'Phthalates', value: 100 },
      { label: 'Flammability', value: 98 },
      { label: 'Physical safety', value: 100 },
    ]
  },
  'CE': {
    image: 'https://i.pinimg.com/736x/90/06/a8/9006a864900694b4280de104de46be95.jpg', // Placeholder
    icon: BadgeCheck,
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-700',
    borderColor: 'border-primary-100',
    organization: 'European Conformity',
    scope: 'European Union',
    defaultDescription: 'Declarative compliance with health, safety, and environmental protection standards for products sold within the EEA.',
    coverageBars: [
      { label: 'Health Safety', value: 94 },
      { label: 'Environmental', value: 90 },
      { label: 'Directives 2009', value: 100 },
      { label: 'Toxicology', value: 96 },
    ]
  },
  'default': {
    icon: ShieldCheck,
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-600',
    borderColor: 'border-slate-100',
    isDefault: true,
    organization: 'DreamGuard Quality',
    scope: 'Internal Standard',
    defaultDescription: 'Rigorously tested by DreamGua  rd labs to meet our internal safety standards.',
    coverageBars: [
      { label: 'Basic Safety', value: 100 },
      { label: 'Materials', value: 90 },
      { label: 'Comfort', value: 100 },
    ]
  }
};

/**
 * Helper to get the full metadata and style for a certificate.
 */
export const getCertificateStyle = (name: string): CertificateStyle => {
  const normalized = name.toUpperCase().trim();

  if (normalized.includes('OEKO')) return CERTIFICATE_REGISTRY['OEKO-TEX'];
  if (normalized.includes('GOTS')) return CERTIFICATE_REGISTRY['GOTS'];
  if (normalized.includes('CPSC')) return CERTIFICATE_REGISTRY['CPSC'];
  if (normalized.includes('CE')) return CERTIFICATE_REGISTRY['CE'];

  return CERTIFICATE_REGISTRY['default'];
};
