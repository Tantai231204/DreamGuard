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
    name: "Basic Service Package",
    price: "199$",
    features: [
      "Wash blankets or sheets",
      "Dry naturally",
      "Free delivery",
    ],
  },
  {
    name: "Family Package",
    price: "499$",
    features: [
      "Complete bedding wash",
      "Steam cleaning and sanitization",
      "Drying and ironing",
      "Free delivery",
      "7-day warranty",
    ],
    featured: true,
  },
  {
    name: "VIP Service Package",
    price: "899$",
    features: [
      "Bedding and mattress cleaning",
      "Steam cleaning and deodorizing",
      "Deep stain removal",
      "Priority delivery",
      "14-day warranty",
    ],
  },
];
