import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Edit3, Eye, Box, Activity, Layers, PackagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AdminStatusBadge } from '@/components/admin';
import {
  normalizeStatus,
  PRODUCT_STATUSES,
  getAllowedStatusTransitions
} from '@/pages/admin/products/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { motion } from 'framer-motion';
import { FullyCustomDialog } from './components/FullyCustomDialog';
import productService from '@/api/services/productService';
import variantService from '@/api/services/variantService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type {
  FullyCustomizedProductResponse,
  CreateFullyCustomizedProductRequest,
  UpdateProductRequest,
  UpdateFullyCustomizedProductRequest
} from '@/api/types';

export default function FullyCustomizeManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FullyCustomizedProductResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['fully-customize-products'],
    queryFn: () => productService.getAllFullyCustomize(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFullyCustomizedProductRequest) => productService.createFullyCustomize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fully-customize-products'] });
      setIsDialogOpen(false);
      toast.success('Template Created Successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Failed to create template.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFullyCustomizedProductRequest) => {
      // 1. Parallelize product metadata update and variant discovery
      const [updatedProduct, variants] = await Promise.all([
        productService.update(data as unknown as UpdateProductRequest),
        variantService.getByProductId(data.id)
      ]);

      const tasks: Promise<unknown>[] = [];

      // 2. Synchronize variant-specific data (SKU, Price, Weight) using the real variant ID
      if (variants && variants.length > 0) {
        const mainVariant = variants[0];
        tasks.push(variantService.update(mainVariant.id, {
          sku: data.sku,
          basePrice: data.basePrice,
          salePrice: data.salePrice,
          weight: data.weight,
          attributes: mainVariant.attributes,
          productId: data.id,
        }));

        // Force all variants to 'Published' status
        variants.forEach(v => {
          tasks.push(variantService.updateStatus({ 
            variantId: v.id, 
            status: 'Published' 
          }));
        });
      }

      // 3. Force master product to 'Published' status
      tasks.push(productService.updateStatus({ 
        productId: data.id, 
        status: 'Published' 
      }));

      await Promise.all(tasks).catch(err => {
        console.error('Synchronization warning for non-critical assets:', err);
        // Ensure success feedback for the primary metadata change
      });

      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fully-customize-products'] });
      setIsDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Template Updated Successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Failed to update template.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: string }) => {
      // 1. Fetch real variants to avoid ID mismatches (Not Found errors)
      const variants = await variantService.getByProductId(productId);
      
      const tasks: Promise<unknown>[] = [
        productService.updateStatus({ productId, status })
      ];

      if (variants && variants.length > 0) {
        variants.forEach(v => {
          tasks.push(variantService.updateStatus({ 
            variantId: v.id, 
            status 
          }));
        });
      }

      await Promise.all(tasks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fully-customize-products'] });
      toast.success('Status Updated Successfully');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Failed to update status.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fully-customize-products'] });
      toast.success('Template Removed');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template.');
    }
  });

  const stats = [
    { label: '3D Templates', value: products.length, icon: Box },
    { label: 'Mattresses', value: products.filter(p => p.fullyCustomizedProductType === 'Mattresses').length, icon: Layers },
    { label: 'Pillows', value: products.filter(p => p.fullyCustomizedProductType === 'Pillows').length, icon: Activity },
    { label: 'Cribs', value: products.filter(p => p.fullyCustomizedProductType === 'Cribs').length, icon: PackagePlus },
  ];

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 overflow-hidden">
      <AdminPageHeader
        title="3D Global Custom Management"
        description="Manage master templates for fully customizable products including Mattresses, Pillows, and Cribs."
        icon={Sparkles}
        stats={stats}
      />

      <div className="flex-1 overflow-hidden p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 h-full flex flex-col overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Active Templates</h3>
              <p className="text-[10px] font-black text-gray-300 mt-0.5 uppercase tracking-[0.2em]">Master Product Catalog</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="h-10 px-6 rounded-xl bg-[#4988c4] hover:bg-[#3a6fa0] text-white font-bold text-xs gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add 3D Template
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 scrollbar-hide">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin opacity-50" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Synchronizing Catalogs...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center animate-pulse">
                  <Box className="w-12 h-12 text-gray-200" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">No 3D Templates Found</h4>
                  <p className="text-sm text-gray-400 max-w-[300px] mt-2 font-bold">
                    Create your first fully customizable product template to enable 3D customer customization.
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-400 pl-8">Product</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-400 text-center">Type</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-400 text-center">Status</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-400 text-center">SKU</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-400 text-right">Base Price</TableHead>
                    <TableHead className="text-right pr-8 font-bold text-[11px] uppercase tracking-widest text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group border-b border-gray-50 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100/50">
                            {product.imageUrls?.[0] ? (
                              <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Box className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                            <p className="text-[11px] font-medium text-gray-400 truncate max-w-[180px]">{product.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
                            product.fullyCustomizedProductType ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                          )}
                        >
                          {product.fullyCustomizedProductType || 'Master Template'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={updateStatusMutation.isPending}>
                            <button className="outline-none focus:ring-0 active:scale-95 transition-transform disabled:opacity-50">
                              <AdminStatusBadge status={normalizeStatus(product.status || 'Draft')} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="min-w-[120px] rounded-xl shadow-xl border-gray-100">
                            {PRODUCT_STATUSES.map((statusOption) => {
                              const currentStatus = normalizeStatus(product.status || 'Draft');
                              const isAllowed = getAllowedStatusTransitions(currentStatus).includes(statusOption.value);
                              const isCurrent = currentStatus === statusOption.value;

                              return (
                                <DropdownMenuItem
                                  key={statusOption.value}
                                  disabled={!isAllowed || isCurrent}
                                  onClick={() => updateStatusMutation.mutate({
                                    productId: product.id,
                                    status: statusOption.value
                                  })}
                                  className={cn(
                                    "text-[11px] font-bold uppercase tracking-wider py-2 cursor-pointer",
                                    isCurrent && "bg-gray-50 text-gray-400 cursor-default"
                                  )}
                                >
                                  {statusOption.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-center font-mono text-[11px] font-bold text-gray-500">
                        {product.sku || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-col items-end">
                          <p className="font-black text-gray-900 text-sm">
                            {(product.salePrice > 0 && product.basePrice > product.salePrice
                              ? product.salePrice
                              : product.basePrice
                            ).toLocaleString()}
                            <span className="text-[10px] text-gray-400 font-bold ml-0.5">VND</span>
                          </p>
                          {product.salePrice > 0 && product.basePrice > product.salePrice && (
                            <p className="text-[10px] text-gray-300 font-bold line-through">
                              {product.basePrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-gray-400 hover:text-[#4988c4] hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDialogOpen(true);
                            }}
                            className="h-9 w-9 rounded-xl text-gray-400 hover:text-[#4988c4] hover:bg-white border border-transparent hover:border-gray-100 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            className="h-9 w-9 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </motion.div>
      </div>

      <FullyCustomDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSubmit={async (data) => {
          if ('id' in data) {
            await updateMutation.mutateAsync(data as UpdateFullyCustomizedProductRequest);
          } else {
            await createMutation.mutateAsync(data as CreateFullyCustomizedProductRequest);
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
