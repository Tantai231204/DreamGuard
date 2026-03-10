import { z } from "zod"

export const checkoutSchema = z.object({
    // Delivery Information
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),

    // Internal Order Info
    addressId: z.string().nullable().optional(),
    userVoucherId: z.string().nullable().optional(),

    // Address
    streetAddress: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    district: z.string().min(2, "District is required"),
    ward: z.string().min(2, "Ward is required"),

    // Optional
    orderNotes: z.string().optional(),

    // Payment
    paymentMethod: z.enum(["VnPay", "COD"], {
        required_error: "Please select a payment method",
    }),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
