import { z } from "zod";

export const customBookingSchema = z.object({
  images: z.array(z.instanceof(File)).min(1, "Please upload at least 1 image"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  customerPhone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\s()-]+$/, "Invalid phone number format"),
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
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export type CustomBookingFormValues = z.infer<typeof customBookingSchema>;

/** Fields that must be valid before advancing each step */
export const STEP_FIELDS: (keyof CustomBookingFormValues)[][] = [
  ["images", "description"],
  ["customerName", "customerPhone", "address"],
];
