import * as z from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name too long"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
    summary: z.string().min(5, "Summary too short (min 5)").max(500, "Summary too long"),
    description: z.string().min(10, "Description too short (min 10)"),
    cateId: z.coerce.number().positive("Category is required"),
    subCateId: z.coerce.number().optional().nullable(),
    material: z.string().optional().nullable(),
    ageGroup: z.string().optional().nullable(),
    warrantyPolicyDay: z.coerce.number().min(0).default(0),
    returnPolicyDay: z.coerce.number().min(0).default(0),
    status: z.string().default('Draft'),
    CertificateIds: z.array(z.string()).default([]),
    fullyCustomizedProductType: z.enum(["None", "Mattresses", "Pillows", "Cribs"]).default("None"),
    sku: z.string().optional(),
    basePrice: z.coerce.number().min(0).default(0),
    salePrice: z.coerce.number().min(0).default(0),
    weight: z.coerce.number().min(0).default(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;
