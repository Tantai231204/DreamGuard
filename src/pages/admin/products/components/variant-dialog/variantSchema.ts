import * as z from 'zod';

export const variantSchema = z.object({
    sku: z.string()
        .min(3, "SKU must be at least 3 characters")
        .max(50, "SKU too long")
        .regex(/^[a-zA-Z0-9\s_-]+$/, "SKU contains invalid characters"),
    basePrice: z.coerce.number()
        .positive("Base price must be greater than 0")
        .min(1000, "Price must be at least 1.000 ₫"),
    salePrice: z.coerce.number()
        .min(0, "Sale price cannot be negative"),
    weight: z.coerce.number()
        .min(0, "Weight cannot be negative"),
    stockQuantity: z.coerce.number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),
    status: z.string().min(1, "Status is required"),
    isNew: z.boolean().default(false),
    isCustomizable: z.boolean().default(false),
    customizeLabel: z.string().optional(),
    // Attributes
    width: z.coerce.number().min(0).optional().nullable(),
    length: z.coerce.number().min(0).optional().nullable(),
    thickness: z.coerce.number().min(0).optional().nullable(),
    colorName: z.string().optional().nullable(),
    colorHex: z.string().optional().nullable(),
    pendingCustoms: z.array(z.object({
        customizeTypeId: z.string(),
        overridePrice: z.number().nullable(),
        overrideMultiplier: z.number().nullable().optional(),
    })).optional().default([]),
}).superRefine((data, ctx) => {
    if (data.salePrice > 0 && data.salePrice > data.basePrice) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sale price cannot exceed base price",
            path: ["salePrice"],
        });
    }
});

export type VariantFormValues = z.infer<typeof variantSchema>;
