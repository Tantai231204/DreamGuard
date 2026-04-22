import { z } from "zod";

export const bookingSchema = z.object({
  // selectedProducts is step 0 - just tracking product IDs
  selectedProducts: z.array(z.string()).min(1, "Please select at least one product"),
  // items is step 1 - tier + quantity for each product
  items: z.array(z.object({
    itemType: z.string().min(1, "Please select item type"),
    packageId: z.string().min(1, "Please select a package"),
    quantity: z.number().min(1),
  })).min(1, "Please choose a service tier for at least one product"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time slot"),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  customerPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^(0|84)(3|5|7|8|9|2)([0-9]{8,9})$/, "Invalid phone number format (e.g. 0912345678)"),
  customerEmail: z
    .string()
    .email("Invalid email address")
    .or(z.literal(""))
    .optional(),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    ward: z.string().optional(),
    district: z.string().min(1, "District is required"),
    city: z.string().min(1, "City is required"),
  }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  mediaUploads: z.array(z.string()).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const STEP_FIELDS: (keyof BookingFormValues)[][] = [
  ["selectedProducts"],        // Step 0: Product selection
  ["items"],                   // Step 1: Tier selection
  [],                          // Step 2: Media uploads (Opt)
  ["scheduledDate", "scheduledTime"], // Step 3: Schedule
  ["customerName", "customerPhone", "address"], // Step 4: Contact & Address
  [],                          // Step 5: Confirm
];
