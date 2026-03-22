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
    id: "basic",
    name: "Basic Package",
    price: "200.000 VNĐ",
    priceValue: 200000,
    priceNote: "/ session",
    description: "Perfect for routine cleaning needs — keep things fresh.",
    features: [
      "Wash blankets or bed sheets",
      "Natural air dry",
      "Baby-safe organic detergent",
      "Free pickup & delivery (5km)",
    ],
    includes: [
      "1× Full bedding set wash",
      "2× Pillow cleaning",
      "Stain pre-treatment",
    ],
  },
  {
    id: "family",
    name: "Family Package",
    price: "500.000 VNĐ",
    priceValue: 500000,
    priceNote: "/ session",
    description: "Our most popular — comprehensive care for the whole family.",
    features: [
      "Complete bedding set cleaning",
      "Steam sanitization",
      "Tumble dry & iron",
      "Free pickup & delivery (10km)",
      "7-day quality warranty",
      "Complimentary lavender sachet",
    ],
    includes: [
      "2× Full bedding set wash",
      "4× Pillow deep clean",
      "1× Mattress surface clean",
      "Steam & UV sanitization",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "vip",
    name: "VIP Package",
    price: "900.000 VNĐ",
    priceValue: 900000,
    priceNote: "/ session",
    description: "Premium treatment with every possible comfort.",
    features: [
      "Bedding + mattress deep clean",
      "Steam & UV deodorizing",
      "Deep stain removal",
      "Priority pickup & delivery",
      "14-day quality warranty",
      "Sachet + refreshing spray set",
      "10% off next booking",
    ],
    includes: [
      "2× Full bedding set wash",
      "6× Pillow deep clean",
      "1× Full mattress deep clean",
      "1× Stroller OR car seat clean",
      "UV sanitization pass",
    ],
    badge: "Best Value",
  },
];

/* ===== Process Steps ===== */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Book Online",
    description: "Choose a package or customize your service, pick a date & time.",
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
