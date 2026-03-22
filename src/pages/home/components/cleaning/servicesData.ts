export interface Service {
  title: string;
  description: string;
}

export interface Package {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}

export const services: Service[] = [
  {
    title: "Professional dry cleaning",
    description: "Advanced steam cleaning technology eliminates 99.9% of bacteria and dust mites.",
  },
  {
    title: "Door-to-door delivery",
    description: "Our staff provides fast pickup and delivery within 24 hours.",
  },
  {
    title: "Safe for babies",
    description: "Uses organic detergents that do not irritate the skin.",
  },
];

export const processes: string[] = [
  "Receiving and inspecting the products condition",
  "Preliminary treatment of stubborn stains",
  "Washing with safe organic detergents",
  "Drying and deodorizing with UV rays",
  "Packaging and delivery to your door",
];

export const packages: Package[] = [
  {
    name: "Standard Clean",
    price: "From 150.000 VNĐ",
    features: [
      "Surface vacuuming & allergen removal",
      "Organic solution deodorizer",
      "Natural airing or tumble dry",
      "Standard material warranty",
    ],
  },
  {
    name: "Deep Clean",
    price: "From 350.000 VNĐ",
    features: [
      "Deep extraction core vacuuming",
      "Organic deep stain pre-treat cleanser",
      "Definite stubborn stain removal",
      "150°C Steam & UV light sanitizing",
      "7-day complete quality warranty",
    ],
    featured: true,
  },
  {
    name: "Premium Restore",
    price: "From 600.000 VNĐ",
    features: [
      "All Deep Clean benefits included",
      "Deep restoration from persistent odors",
      "Certified plant extract mist aroma setup",
      "Priority queuing for delivery queue",
      "14-day absolute absolute warranty",
    ],
  },
];
