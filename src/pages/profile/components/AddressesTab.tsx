import { useState } from "react";
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { MapPin, Phone, CheckCircle2, Home, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import type { Address } from "../../../api/types/address";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import vnAddress from "@/shared/data/vnAddress.json";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useAddress";

export default function AddressesTab() {
  const { data: addresses = [], isPending } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const deleteMutation = useDeleteAddress();

  const handleSetDefault = (id: string) => {
    console.log("Set default:", id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isPending) {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Address Book</h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Manage your shipping addresses
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-lg shadow-[#4988c4]/25 hover:shadow-[#4988c4]/40 transition-all active:scale-95 rounded-2xl px-5 h-11 font-semibold text-sm gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {/* Address Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {addresses.map((address: Address) => (
          <div
            key={address.addressId}
            className={`group relative rounded-3xl bg-white overflow-hidden transition-all duration-300 ${address.isDefault
              ? "border-2 border-[#4988c4]/50 shadow-lg shadow-[#4988c4]/10"
              : "border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60"
              }`}
            style={
              !address.isDefault
                ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }
                : undefined
            }
          >
            {/* Accent stripe */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${address.isDefault
                ? "bg-gradient-to-r from-[#4988c4] via-sky-400 to-cyan-300"
                : "bg-gradient-to-r from-gray-200 to-gray-100 group-hover:from-[#4988c4]/40 group-hover:to-cyan-200/60 transition-all duration-300"
                }`}
            />

            {/* Default badge */}
            {address.isDefault && (
              <div className="absolute top-1 right-4 z-10">
                <div className="bg-gradient-to-r from-[#4988c4] to-sky-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <Star className="h-3 w-3 fill-white" />
                  Default
                </div>
              </div>
            )}

            <div className="px-6 pt-6 pb-5">
              {/* Name + Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${address.isDefault
                    ? "bg-gradient-to-br from-blue-100 to-sky-200"
                    : "bg-gray-50 group-hover:bg-blue-50 transition-colors"
                    }`}
                >
                  <Home
                    className={`h-5 w-5 ${address.isDefault ? "text-[#4988c4]" : "text-gray-400 group-hover:text-[#4988c4] transition-colors"
                      }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {address.receiverName}
                  </h3>
                  {address.isDefault && (
                    <p className="text-xs text-[#4988c4] font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Default shipping address
                    </p>
                  )}
                </div>

                {/* Hover actions */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-400 hover:text-[#4988c4] transition-all flex items-center justify-center"
                    onClick={() => {
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                  >
                    <Pencil1Icon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
                    onClick={() => handleDelete(address.addressId)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-50 mb-4" />

              {/* Info block */}
              <div className="space-y-2.5">
                {/* Phone */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${address.isDefault ? "bg-blue-50/60 border border-blue-100/80" : "bg-gray-50 border border-gray-100"
                    }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-[#4988c4]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 tracking-wide">
                    {address.phoneNumber}
                  </span>
                </div>

                {/* Address */}
                <div
                  className={`flex items-start gap-3 px-4 py-3 rounded-2xl ${address.isDefault ? "bg-blue-50/60 border border-blue-100/80" : "bg-gray-50 border border-gray-100"
                    }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#4988c4]" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                    {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                  </p>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                    className="h-8 px-3 text-gray-500 hover:text-[#4988c4] hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold border border-transparent hover:border-blue-100 gap-1.5"
                  >
                    <Pencil1Icon className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.addressId)}
                    className="h-8 px-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold border border-transparent hover:border-red-100 gap-1.5"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-semibold text-gray-500 hover:text-[#4988c4] hover:border-[#4988c4]/30 hover:bg-blue-50 rounded-xl transition-all border-gray-200 gap-1.5"
                    onClick={() => handleSetDefault(address.addressId)}
                  >
                    <Star className="h-3 w-3" />
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {addresses.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <MapPin className="h-9 w-9 text-[#4988c4]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No addresses yet</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Add an address to make your shopping checkout experience faster and easier.
          </p>
          <Button
            className="mt-6 bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-lg shadow-[#4988c4]/20 transition-all active:scale-95 rounded-2xl h-11 px-6 font-semibold gap-2"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Add First Address
          </Button>
        </div>
      )}

      <AddressFormDialog
        key={showForm ? (editingAddress?.addressId || "new") : "closed"}
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingAddress}
      />
    </div>
  );
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Address | null;
}

function AddressFormDialog({ open, onOpenChange, initialData }: AddressFormDialogProps) {
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      const province = vnAddress.find(p => p.name === initialData.province)?.code || "";
      let district = "";
      let ward = "";

      if (province) {
        const provinceData = vnAddress.find(p => p.code === province);
        if (provinceData) {
          district = provinceData.districts.find(d => d.name === initialData.district)?.code || "";
          if (district) {
            const districtData = provinceData.districts.find(d => d.code === district);
            ward = districtData?.wards.find(w => w.name === initialData.ward)?.code || "";
          }
        }
      }

      return {
        receiverName: initialData.receiverName,
        phoneNumber: initialData.phoneNumber,
        street: initialData.street,
        province,
        district,
        ward,
      };
    }
    return {
      receiverName: "",
      phoneNumber: "",
      street: "",
      province: "",
      district: "",
      ward: "",
    };
  });

  const selectedProv = vnAddress.find((p) => p.code === formData.province);
  const districts = selectedProv?.districts ?? [];
  const selectedDist = districts.find((d) => d.code === formData.district);
  const wards = selectedDist?.wards ?? [];

  const handleSubmit = () => {
    if (!formData.receiverName || !formData.phoneNumber || !formData.street || !formData.province || !formData.district || !formData.ward) return;

    const provinceName = vnAddress.find((p) => p.code === formData.province)?.name ?? "";
    const districtName = districts.find((d) => d.code === formData.district)?.name ?? "";
    const wardName = wards.find((w) => w.code === formData.ward)?.name ?? "";

    const payload = {
      receiverName: formData.receiverName,
      phoneNumber: formData.phoneNumber,
      street: formData.street,
      province: provinceName,
      city: provinceName,
      district: districtName,
      ward: wardName,
    };

    if (initialData?.addressId) {
      updateMutation.mutate({ id: initialData.addressId, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl shadow-gray-300/40 p-0">
        {/* Dialog Header */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-blue-50 to-sky-50/50 relative">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#4988c4] to-cyan-300" />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-[#4988c4]" />
              </div>
              {initialData ? "Update Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1">
              {initialData
                ? "Update your shipping address information below."
                : "Add a new address for a faster checkout experience."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Receiver + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="recipient" className="text-sm font-semibold text-gray-700">
                Receiver Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="recipient"
                value={formData.receiverName}
                onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                placeholder="Ex: John Doe"
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="0912 345 678"
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
          </div>

          {/* Street */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
              Detailed Address <span className="text-red-400">*</span>
            </Label>
            <Input
              id="address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="House number, street name..."
              className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
            />
          </div>

          {/* Location selects */}
          <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Location</p>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Province / City <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(val) => setFormData({ ...formData, province: val, district: "", ward: "" })}
              >
                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                  <SelectValue placeholder="Select province/city" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {vnAddress.map((prov) => (
                    <SelectItem key={prov.code} value={prov.code}>{prov.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  District <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(val) => setFormData({ ...formData, district: val, ward: "" })}
                  disabled={!formData.province}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {districts.map((dist) => (
                      <SelectItem key={dist.code} value={dist.code}>{dist.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Ward / Commune <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.ward}
                  onValueChange={(val) => setFormData({ ...formData, ward: val })}
                  disabled={!formData.district}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.code}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-2xl font-semibold text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-2xl bg-[#4988c4] hover:bg-[#3b6fa3] text-white font-semibold shadow-lg shadow-[#4988c4]/25 transition-all active:scale-[0.98] gap-2"
              onClick={handleSubmit}
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              <MapPin className="h-4 w-4" />
              {initialData ? "Save Changes" : "Save Address"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}