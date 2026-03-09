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
    zipCode: z.string().optional(),

    // Optional
    orderNotes: z.string().optional(),

    // Payment
    paymentMethod: z.enum(["card", "paypal"], {
        required_error: "Please select a payment method",
    }),

    // Credit Card (conditional)
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),

    // Shipping address checkbox
    saveAddress: z.boolean().optional(),
}).refine((data) => {
    // If payment method is card, validate card fields
    if (data.paymentMethod === "card") {
        return (
            data.cardNumber &&
            data.cardNumber.replace(/\s/g, "").length === 16 &&
            data.cardName &&
            data.cardName.length >= 3 &&
            data.expiryDate &&
            data.expiryDate.length === 5 &&
            data.cvv &&
            data.cvv.length === 3
        )
    }
    return true
}, {
    message: "Please fill in all credit card details",
    path: ["cardNumber"],
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
