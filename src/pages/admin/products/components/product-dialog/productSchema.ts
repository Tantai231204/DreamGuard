import * as z from 'zod';

export const productSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name too long"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug contains invalid characters (lowercase, numbers, - only)"),
    summary: z.string().min(10, "Summary must be at least 10 characters").max(500, "Summary too long"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    cateId: z.coerce.number().positive("Main Category is required"),
    subCateId: z.coerce.number().optional().nullable(),
    material: z.string().min(2, "Material information is required"),
    ageGroup: z.string().optional().nullable(),
    warrantyPolicyDay: z.coerce.number().min(0).default(0),
    returnPolicyDay: z.coerce.number().min(0).default(0),
    status: z.string().default('Draft'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
