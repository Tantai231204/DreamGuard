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
    color: "from-primary-500 to-primary-600",
    lightBg: "bg-primary-50",
    borderColor: "border-primary-200 hover:border-primary-400",
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

