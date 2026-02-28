import { z } from "zod";

export const bookingSchema = z.object({
  packageId: z.string().min(1, "Please select a package"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time slot"),
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
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

/** Fields that must be valid before advancing each step */
export const STEP_FIELDS: (keyof BookingFormValues)[][] = [
  ["packageId"],
  ["scheduledDate", "scheduledTime"],
  ["customerName", "customerPhone", "address"],
  [],
];
