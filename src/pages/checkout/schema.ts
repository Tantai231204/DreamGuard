import { z } from "zod"

const addressSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    addressId: z.string().nullable().optional(),
    userVoucherId: z.string().nullable().optional(),
    streetAddress: z.string().min(5, "Street address is too short"),
    city: z.string().min(1, "City is required"),
    district: z.string().min(1, "District is required"),
    ward: z.string().min(1, "Ward is required"),
    orderNotes: z.string().optional(),
    paymentMethod: z.enum(["VnPay", "COD"]),
})

export const checkoutSchema = addressSchema.superRefine((data) => {
    // If addressId is NOT provided, all other address fields MUST be filled
    // However, for simplicity and because we usually want to show the form, 
    // we only check basic requirements here.
    // If addressId is present, we trust the backend to have the details,
    // but the UI usually fills them anyway.
    
    // Most common issue: user selects saved address but city code mapping fails (remains empty)
    if (data.addressId) {
        // When using saved address, we can be more lenient with individual codes
        return; 
    }
})

export type CheckoutFormData = z.infer<typeof addressSchema>
