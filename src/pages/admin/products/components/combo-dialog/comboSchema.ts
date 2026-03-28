import * as z from 'zod';

export const comboItemSchema = z.object({
  id: z.string(),
  productVariantId: z.string().min(1, "Product variant is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  label: z.string(),
  productName: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  salePrice: z.coerce.number(),
  basePrice: z.coerce.number(),
});

export const comboSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name too long"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug contains invalid characters"),
    ageGroup: z.coerce.number().min(0, "Age group is required"),
    color: z.string().optional(),
    size: z.string().optional(),
    basePrice: z.coerce.number().min(0, "Base price is required"),
    salePrice: z.coerce.number().min(0, "Selling price is required"),
    description: z.string().min(5, "Description is too short").optional().or(z.literal('')),
    imageUrl: z.string().url("Valid image URL is required").optional().or(z.literal('')),
    imagePublicId: z.string().optional(),
    comboParentId: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    items: z.array(comboItemSchema),
}).refine((data) => {
    if (data.salePrice > data.basePrice) return false;
    return true;
}, {
    message: "Sale price cannot exceed base price",
    path: ["salePrice"]
});

export type ComboItemValues = z.infer<typeof comboItemSchema>;
export type ComboFormValues = z.infer<typeof comboSchema>;
