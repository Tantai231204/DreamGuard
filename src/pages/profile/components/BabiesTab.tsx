import { useMemo, useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Baby, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatPrice } from "../utils";
import { useBabyProfiles, useDeleteBabyProfile } from "@/hooks/useBabyProfile";
import { useProducts } from "@/hooks/queries/useProduct";
import BabyFormDialog, { type BabyFormDialogProps } from "./baby/BabyFormDialog";
import BabyCard from "./baby/BabyCard";

export default function BabiesTab() {
  const { data: babies = [], isLoading } = useBabyProfiles();
  const { data: apiProducts = [] } = useProducts();
  const deleteMutation = useDeleteBabyProfile();
  const [showForm, setShowForm] = useState(false);
  const [editingBaby, setEditingBaby] = useState<BabyFormDialogProps["initialData"]>(null);

  const recommendations = useMemo(() => {
    return apiProducts
      .filter((product) => String(product.status).toLowerCase() !== "outofstock")
      .slice(0, 3)
      .map((product) => {
        const variants = product.variants ?? [];
        const price = variants.length > 0
          ? Math.min(...variants.map(v => v.salePrice || v.basePrice))
          : product.minPrice || product.maxPrice || 0;
          
        return {
          id: product.id,
          name: product.name,
          price,
          image: product.imageUrls?.[0] || product.assets?.[0]?.url || "",
          forAge: product.ageGroup ? `${product.ageGroup}` : "Mọi độ tuổi",
        };
      });
  }, [apiProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#4988c4]/20 border-t-[#4988c4] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Baby Profiles</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your family's profiles for personalized product recommendations.
          </p>
        </div>
        <Button
          variant="premium"
          onClick={() => {
            setEditingBaby(null);
            setShowForm(true);
          }}
          className="px-6 h-11 rounded-xl gap-2"
        >
          <PlusIcon className="h-4 w-4 relative z-10" />
          <span className="relative z-10">Add Profile</span>
        </Button>
      </div>

      {/* Baby Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {babies.map((baby) => (
          <BabyCard
            key={baby.babyId}
            baby={baby}
            isDeleting={deleteMutation.isPending}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(b) => {
              setEditingBaby({
                babyId: b.babyId,
                name: b.name,
                gender: b.gender,
                dateOfBirth: b.dateOfBirth ? new Date(b.dateOfBirth) : undefined,
              });
              setShowForm(true);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {babies.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
            <Baby className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No baby profiles found</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">
            Create a profile to unlock personalized recommendations and premium growth tracking.
          </p>
          <Button
            variant="premium"
            className="mt-8 h-12 px-10 rounded-2xl gap-2"
            onClick={() => {
              setEditingBaby(null);
              setShowForm(true);
            }}
          >
            <PlusIcon className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Add First Profile</span>
          </Button>
        </div>
      )}

      {/* Product Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden animate-in fade-in duration-700 delay-200">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Recommended for your babies</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Based on growth stages</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-[#4988c4]/30 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-[#4988c4] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs font-black text-[#4988c4] mt-1">
                      {formatPrice(product.price)}
                    </p>
                    <span className="inline-block mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {product.forAge}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#4988c4] transition-all transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BabyFormDialog
        key={showForm ? (editingBaby?.babyId || "new") : "closed"}
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingBaby}
      />
    </div>
  );
}
