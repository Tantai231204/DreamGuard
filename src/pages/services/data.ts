import {
  Baby,
  Car,
  ClipboardCheck,
  Clock,
  Droplets,
  PackageCheck,
  Sparkles,
  SprayCan,
  Truck,
  ShieldCheck,
  Shirt,
} from "lucide-react";
import type {
  ServiceCategory,
  ServiceItemOption,
  ProcessStep,
  PricingPackage,
} from "./types";

/* ===== Service Categories ===== */
export const serviceCategories: ServiceCategory[] = [
  {
    type: "deep_clean",
    title: "Deep Cleaning",
    description:
      "Deep steam cleaning at 150°C eliminates 99.9% of bacteria and dust mites from bedding & mattresses.",
    icon: Sparkles,
    color: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    priceFrom: "350.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  },
  {
    type: "basic_clean",
    title: "Basic Wash & Dry",
    description:
      "Gentle wash, tumble dry and deodorize blankets, sheets & pillows with baby-safe detergent.",
    icon: Droplets,
    color: "from-cyan-500 to-cyan-600",
    lightBg: "bg-cyan-50",
    borderColor: "border-cyan-200 hover:border-cyan-400",
    priceFrom: "180.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=300&fit=crop",
  },
  {
    type: "mattress_clean",
    title: "Mattress Cleaning",
    description:
      "Deep vacuum, stubborn stain treatment and UV deodorizing for all mattress sizes.",
    icon: Shirt,
    color: "from-indigo-500 to-indigo-600",
    lightBg: "bg-indigo-50",
    borderColor: "border-indigo-200 hover:border-indigo-400",
    priceFrom: "250.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
  },
  {
    type: "stroller_clean",
    title: "Stroller Cleaning",
    description:
      "Full disassembly, fabric wash, frame sanitization and reassembly of baby strollers.",
    icon: Baby,
    color: "from-pink-500 to-pink-600",
    lightBg: "bg-pink-50",
    borderColor: "border-pink-200 hover:border-pink-400",
    priceFrom: "280.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1586085735472-7cf7f7094160?w=400&h=300&fit=crop",
  },
  {
    type: "carseat_clean",
    title: "Car Seat Cleaning",
    description:
      "Deep clean child car seats — remove stains, sanitize and deodorize for a hygienic ride.",
    icon: Car,
    color: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    priceFrom: "200.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=300&fit=crop",
  },
  {
    type: "toy_sanitize",
    title: "Toy Sanitization",
    description:
      "Clean and sanitize toys with organic solution — safe for babies who put things in their mouth.",
    icon: SprayCan,
    color: "from-amber-500 to-amber-600",
    lightBg: "bg-amber-50",
    borderColor: "border-amber-200 hover:border-amber-400",
    priceFrom: "100.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop",
  },
];

/* ===== Service Items (for custom booking) ===== */
export const serviceItems: ServiceItemOption[] = [
  // Deep clean
  { id: "dc-1", name: "King-size mattress (1.8m)", unitPrice: 450000, serviceType: "deep_clean" },
  { id: "dc-2", name: "Queen-size mattress (1.6m)", unitPrice: 400000, serviceType: "deep_clean" },
  { id: "dc-3", name: "Single mattress (1.2m)", unitPrice: 300000, serviceType: "deep_clean" },
  { id: "dc-4", name: "Fabric sofa", unitPrice: 350000, serviceType: "deep_clean" },
  // Basic clean
  { id: "bc-1", name: "Full bedding set (double)", unitPrice: 250000, serviceType: "basic_clean" },
  { id: "bc-2", name: "Full bedding set (single)", unitPrice: 180000, serviceType: "basic_clean" },
  { id: "bc-3", name: "Blanket", unitPrice: 100000, serviceType: "basic_clean" },
  { id: "bc-4", name: "Pillow (each)", unitPrice: 50000, serviceType: "basic_clean" },
  // Mattress clean
  { id: "mc-1", name: "Double mattress (1.8m)", unitPrice: 350000, serviceType: "mattress_clean" },
  { id: "mc-2", name: "Single mattress (1.2m)", unitPrice: 250000, serviceType: "mattress_clean" },
  { id: "mc-3", name: "Baby crib mattress", unitPrice: 180000, serviceType: "mattress_clean" },
  { id: "mc-4", name: "Bed sheet", unitPrice: 80000, serviceType: "mattress_clean" },
  // Stroller clean
  { id: "sc-1", name: "Single stroller", unitPrice: 280000, serviceType: "stroller_clean" },
  { id: "sc-2", name: "Double stroller", unitPrice: 380000, serviceType: "stroller_clean" },
  { id: "sc-3", name: "Portable bassinet", unitPrice: 200000, serviceType: "stroller_clean" },
  // Car seat clean
  { id: "cs-1", name: "Infant car seat (Group 0+)", unitPrice: 200000, serviceType: "carseat_clean" },
  { id: "cs-2", name: "Toddler car seat (Group 1-2)", unitPrice: 250000, serviceType: "carseat_clean" },
  { id: "cs-3", name: "Booster seat", unitPrice: 150000, serviceType: "carseat_clean" },
  // Toy sanitize
  { id: "ts-1", name: "Plastic toy set (10 items)", unitPrice: 150000, serviceType: "toy_sanitize" },
  { id: "ts-2", name: "Large stuffed animal (>30cm)", unitPrice: 100000, serviceType: "toy_sanitize" },
  { id: "ts-3", name: "Small stuffed animal (<30cm)", unitPrice: 70000, serviceType: "toy_sanitize" },
  { id: "ts-4", name: "Wooden toy set", unitPrice: 120000, serviceType: "toy_sanitize" },
];

/* ===== Pricing Packages (pre-made packages) ===== */
export const pricingPackages: PricingPackage[] = [
  {
    id: "standard",
    name: "Standard Clean",
    price: "From 150.000 VNĐ",
    priceValue: 150000,
    priceNote: "",
    description: "Perfect for routine freshening and surface cleaning.",
    features: [
      "Surface vacuuming & dust mite removal",
      "Standard organic solution deodorizer",
      "Natural airing or tumble try",
      "Free pickup & delivery (within 5km)",
    ],
    includes: [
      "Spot stain treatment",
      "Standard material guard",
    ],
  },
  {
    id: "deep",
    name: "Deep Clean",
    price: "From 350.000 VNĐ",
    priceValue: 350000,
    priceNote: "",
    description: "The gold standard — deep sanitation with specialized tool lists.",
    features: [
      "Deep-soil vacuum extractors",
      "Deep steam sanitation at 150°C",
      "UV light bug deodorization",
      "Full dimension scale scrub processing",
      "7-day quality breakdown warranty",
    ],
    includes: [
      "Severe stain extraction sets",
      "99.9% germ elimination passes",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium Restore",
    price: "From 600.000 VNĐ",
    priceValue: 600000,
    priceNote: "",
    description: "Fully loaded restoring treatment for premium look layouts.",
    features: [
      "All Deep Clean features included",
      "Full restoration from bad persistent odor",
      "Plant extract mist aroma setup",
      "Priority order queuing breakdown",
      "14-day absolute breakdown warranty",
    ],
    includes: [
      "Deep restoration pass setups",
      "Complementary item protective coating",
    ],
    badge: "Best Value",
  },
];

/* ===== Process Steps ===== */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Select Your Items",
    description: "Pick what needs cleaning and select a service level (Standard or Deep) per item.",
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: "We Come to You",
    description: "Our certified technician arrives at your door within the chosen time slot.",
    icon: Truck,
  },
  {
    step: 3,
    title: "Professional Cleaning",
    description: "We clean using advanced technology & 100% baby-safe organic solutions.",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Inspect & Handover",
    description: "Quality check, handover and service warranty — satisfaction guaranteed.",
    icon: PackageCheck,
  },
];

/* ===== Available Time Slots ===== */
export const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

/* ===== Trust Stats ===== */
export const trustStats = [
  { icon: ShieldCheck, value: "99.9%", label: "Bacteria eliminated" },
  { icon: Baby, value: "5,000+", label: "Families trust us" },
  { icon: Clock, value: "24h", label: "Fast turnaround" },
  { icon: Sparkles, value: "100%", label: "Organic & safe" },
];

/* ===== Product Types with Per-Product Service Tiers ===== */
export interface ServiceTier {
  tierId: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
  featured?: boolean;
}

export interface ProductType {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof import("lucide-react");
  tiers: ServiceTier[];
}

export const productTypes: ProductType[] = [
  {
    id: "mattress",
    label: "Mattress",
    description: "Deep vacuum, stain treatment and UV deodorizing for all mattress sizes.",
    icon: "BedDouble",
    tiers: [
      {
        tierId: "basic",
        name: "Standard Clean",
        price: 250000,
        description: "Surface vacuuming and spot stain treatment.",
        features: ["Surface vacuum", "Spot stain treatment", "Natural air dry", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Deep Clean",
        price: 500000,
        description: "Full steam sanitization with deep stain removal.",
        features: ["Deep steam clean at 150°C", "Full stain removal", "UV sanitization", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Premium Restore",
        price: 900000,
        description: "Complete mattress restoration with anti-mite treatment.",
        features: ["Deep steam + UV clean", "Anti-dust-mite treatment", "Deodorizing spray", "Priority pickup & delivery", "14-day warranty", "10% off next booking"],
        badge: "Best Value",
      },
    ],
  },
  {
    id: "blanket",
    label: "Blanket",
    description: "Gentle wash, tumble dry and deodorize blankets with baby-safe detergent.",
    icon: "Layers",
    tiers: [
      {
        tierId: "basic",
        name: "Quick Wash",
        price: 120000,
        description: "Standard wash and natural air dry.",
        features: ["Gentle machine wash", "Baby-safe detergent", "Natural air dry", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Full Care",
        price: 280000,
        description: "Wash, tumble dry and freshness treatment.",
        features: ["Deep wash cycle", "Tumble dry & iron", "Fabric softener treatment", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Luxury Treatment",
        price: 500000,
        description: "Premium wash with steam sanitization and lavender sachet.",
        features: ["Premium wash cycle", "Steam sanitization", "Lavender scent treatment", "Priority pickup & delivery", "14-day warranty", "Complimentary sachet set"],
        badge: "Best Value",
      },
    ],
  },
  {
    id: "bedsheet",
    label: "Bed Sheet",
    description: "Professional laundering with stain pre-treatment for all sheet sizes.",
    icon: "SquareStack",
    tiers: [
      {
        tierId: "basic",
        name: "Standard Wash",
        price: 90000,
        description: "Basic wash with stain pre-treatment.",
        features: ["Machine wash", "Stain pre-treatment", "Natural air dry", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Deep Wash",
        price: 190000,
        description: "Deep wash with ironing and folding.",
        features: ["Deep wash cycle", "Steam iron & fold", "Fabric softener", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Premium Laundry",
        price: 350000,
        description: "Full laundry service with UV sanitization.",
        features: ["Premium wash", "UV sanitization", "Professional ironing", "Priority delivery", "14-day warranty", "Refreshing spray"],
        badge: "Best Value",
      },
    ],
  },
  {
    id: "pillow",
    label: "Pillow",
    description: "Thorough cleaning and sanitization for all pillow types.",
    icon: "CloudSun",
    tiers: [
      {
        tierId: "basic",
        name: "Basic Wash",
        price: 60000,
        description: "Standard wash and natural air dry.",
        features: ["Gentle wash", "Baby-safe detergent", "Air dry", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Deep Sanitize",
        price: 130000,
        description: "Deep wash with UV sanitization.",
        features: ["Deep wash", "UV sanitization", "Tumble dry", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Full Restore",
        price: 220000,
        description: "Complete restoration with anti-bacterial treatment.",
        features: ["Full restoration wash", "Anti-bacterial treatment", "Fluff restore", "Priority delivery", "14-day warranty", "Lavender sachet"],
        badge: "Best Value",
      },
    ],
  },
  {
    id: "stroller",
    label: "Stroller",
    description: "Full disassembly, fabric wash, frame sanitization and reassembly.",
    icon: "Baby",
    tiers: [
      {
        tierId: "basic",
        name: "Quick Clean",
        price: 280000,
        description: "Surface wipe-down and fabric spot clean.",
        features: ["Surface wipe-down", "Fabric spot clean", "Frame sanitization", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Full Service",
        price: 450000,
        description: "Full disassembly, deep fabric wash and frame cleaning.",
        features: ["Full disassembly", "Deep fabric wash", "Frame deep clean", "Wheel lubrication", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Complete Overhaul",
        price: 700000,
        description: "Full restoration with UV sanitization and fabric protection.",
        features: ["Full disassembly & wash", "UV sanitization", "Fabric protector coat", "Hardware polish", "Priority delivery", "14-day warranty"],
        badge: "Best Value",
      },
    ],
  },
  {
    id: "carseat",
    label: "Car Seat",
    description: "Deep clean child car seats — remove stains, sanitize and deodorize.",
    icon: "Car",
    tiers: [
      {
        tierId: "basic",
        name: "Standard Clean",
        price: 200000,
        description: "Surface clean and deodorize.",
        features: ["Surface vacuum", "Spot stain removal", "Deodorizing spray", "Free pickup (5km)"],
      },
      {
        tierId: "family",
        name: "Deep Clean",
        price: 350000,
        description: "Full disassembly with deep fabric wash.",
        features: ["Full disassembly", "Deep fabric wash", "Harness cleaning", "Frame sanitization", "Free pickup (10km)", "7-day warranty"],
        featured: true,
        badge: "Most Popular",
      },
      {
        tierId: "vip",
        name: "Premium Restore",
        price: 550000,
        description: "Complete restoration with UV treatment.",
        features: ["Full restoration", "UV sanitization", "Anti-bacterial coat", "Hardware check", "Priority delivery", "14-day warranty"],
        badge: "Best Value",
      },
    ],
  },
];

/** Helper: get price for a product+tier combo */
export function getProductTierPrice(productId: string, tierId: string): number {
  const product = productTypes.find((p) => p.id === productId);
  const tier = product?.tiers.find((t) => t.tierId === tierId);
  return tier?.price ?? 0;
}

