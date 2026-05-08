import { useState, useEffect, useMemo } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import type { Address } from "../../../../api/types/address";
import { useAddresses, useDeleteAddress } from "@/hooks/useAddress";
import { AddressFormDialog } from "./AddressFormDialog";
import { AddressDeleteDialog } from "./AddressDeleteDialog";
import { AddressCard } from "./AddressCard";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 4;

export default function AddressesTab() {
  const { data: addresses = [], isPending } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const deleteMutation = useDeleteAddress();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const [defaultAddressId, setDefaultAddressIdState] = useState<string | null>(
    () => localStorage.getItem("defaultAddressId")
  );

  // Sync default address logic
  useEffect(() => {
    if (addresses.length > 0) {
      const currentDefaultExists = addresses.some(a => a.addressId === defaultAddressId);

      if (!defaultAddressId || !currentDefaultExists) {
        // Auto-pick the first one if no default exists or it was deleted
        const firstId = addresses[0].addressId;
        localStorage.setItem("defaultAddressId", firstId);
        queueMicrotask(() => setDefaultAddressIdState(firstId));
      }
    } else if (defaultAddressId) {
      // Clear if no addresses left
      localStorage.removeItem("defaultAddressId");
      queueMicrotask(() => setDefaultAddressIdState(null));
    }
  }, [addresses, defaultAddressId]);

  const handleSetDefault = (id: string) => {
    localStorage.setItem("defaultAddressId", id);
    setDefaultAddressIdState(id);
    toast.success("Default address updated");
  };

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => {
      const aIsDefault = a.addressId === defaultAddressId;
      const bIsDefault = b.addressId === defaultAddressId;
      return (bIsDefault ? 1 : 0) - (aIsDefault ? 1 : 0);
    });
  }, [addresses, defaultAddressId]);

  const handleDelete = (id: string) => {
    setAddressToDelete(id);
    setDeleteOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(sortedAddresses.length / ITEMS_PER_PAGE));
  const paginatedAddresses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAddresses.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAddresses, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      queueMicrotask(() => setCurrentPage(totalPages));
    }
  }, [totalPages, currentPage]);

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      deleteMutation.mutate(addressToDelete, {
        onSuccess: () => {
          setDeleteOpen(false);
          setAddressToDelete(null);
          toast.success("Address deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete address");
        }
      });
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#4988c4]/20 border-t-[#4988c4] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Address Book
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Manage your shipping addresses
          </p>
        </div>
        <Button
          variant="premium"
          size="premium"
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Address</span>
        </Button>
      </div>

      {/* Address Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {paginatedAddresses.map((address: Address) => (
          <AddressCard
            key={address.addressId}
            address={address}
            isDefault={address.addressId === defaultAddressId}
            onSetDefault={handleSetDefault}
            onEdit={(addr) => {
              setEditingAddress(addr);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination Footer */}
      {!isPending && totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="h-10 px-5 rounded-2xl border-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="h-10 px-5 rounded-2xl border-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-wider hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <MapPin className="h-9 w-9 text-[#4988c4]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            No addresses yet
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Add an address to make your shopping checkout experience faster and
            easier.
          </p>
          <Button
            variant="premium"
            size="premiumLg"
            className="mt-6 gap-2"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add First Address</span>
          </Button>
        </div>
      )}

      <AddressFormDialog
        key={showForm ? (editingAddress?.addressId || "new") : "closed"}
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingAddress}
        isCurrentDefault={editingAddress?.addressId === defaultAddressId}
        onSetDefault={handleSetDefault}
      />

      <AddressDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
