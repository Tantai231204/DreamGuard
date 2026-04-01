import * as z from 'zod';

export const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required'),
    summary: z.string().min(5, 'Summary is required'),
    description: z.string().min(10, 'Description is required'),
    warrantyPolicyDay: z.coerce.number().min(0),
    returnPolicyDay: z.coerce.number().min(0),
    fullyCustomizedProductType: z.enum(['Mattresses', 'Pillows', 'Cribs']),
    sku: z.string().min(3, 'SKU is required'),
    basePrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0),
    weight: z.coerce.number().min(0),
});
