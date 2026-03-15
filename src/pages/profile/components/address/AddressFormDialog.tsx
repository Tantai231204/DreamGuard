import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../../components/ui/select";
import type { Address } from "../../../../api/types/address";
import vnAddress from "@/shared/data/vnAddress.json";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddress";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Address | null;
}

export function AddressFormDialog({ open, onOpenChange, initialData }: AddressFormDialogProps) {
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();

  const [formData, setFormData] = useState(() => {
    if (!initialData) {
      return {
        receiverName: "",
        phoneNumber: "",
        street: "",
        province: "",
        district: "",
        ward: "",
      };
    }

    const province = vnAddress.find((p) => p.name === initialData.province)?.code || "";
    let district = "";
    let ward = "";

    if (province) {
      const provinceData = vnAddress.find((p) => p.code === province);
      if (provinceData) {
        district = provinceData.districts.find((d) => d.name === initialData.district)?.code || "";
        if (district) {
          const districtData = provinceData.districts.find((d) => d.code === district);
          ward = districtData?.wards.find((w) => w.name === initialData.ward)?.code || "";
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
  });

  const selectedProv = vnAddress.find((p) => p.code === formData.province);
  const districts = selectedProv?.districts ?? [];
  const selectedDist = districts.find((d) => d.code === formData.district);
  const wards = selectedDist?.wards ?? [];

  const provinceName = selectedProv?.name || "";
  const districtName = selectedDist?.name || "";
  const wardName = wards.find((w) => w.code === formData.ward)?.name || "";

  const fullAddressPreview = [
    formData.street,
    wardName,
    districtName,
    provinceName,
  ]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = () => {
    if (
      !formData.receiverName ||
      !formData.phoneNumber ||
      !formData.street ||
      !formData.province ||
      !formData.district ||
      !formData.ward
    )
      return;

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
      updateMutation.mutate(
        { id: initialData.addressId, ...payload },
        { onSuccess: () => onOpenChange(false) },
      );
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
              <Label
                htmlFor="recipient"
                className="text-sm font-semibold text-gray-700"
              >
                Receiver Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="recipient"
                value={formData.receiverName}
                onChange={(e) =>
                  setFormData({ ...formData, receiverName: e.target.value })
                }
                placeholder="Ex: John Doe"
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="phone"
                className="text-sm font-semibold text-gray-700"
              >
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="0912 345 678"
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
          </div>

          {/* Street */}
          <div className="space-y-1.5">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-gray-700"
            >
              Detailed Address <span className="text-red-400">*</span>
            </Label>
            <Input
              id="address"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="House number, street name..."
              className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
            />
          </div>

          {/* Location selects */}
          <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              Location
            </p>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Province / City <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.province}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    province: val,
                    district: "",
                    ward: "",
                  })
                }
              >
                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                  <SelectValue placeholder="Select province/city" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {vnAddress.map((prov) => (
                    <SelectItem key={prov.code} value={prov.code}>
                      {prov.name}
                    </SelectItem>
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
                  onValueChange={(val) =>
                    setFormData({ ...formData, district: val, ward: "" })
                  }
                  disabled={!formData.province}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {districts.map((dist) => (
                      <SelectItem key={dist.code} value={dist.code}>
                        {dist.name}
                      </SelectItem>
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
                  onValueChange={(val) =>
                    setFormData({ ...formData, ward: val })
                  }
                  disabled={!formData.district}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.code}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Preview */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-[#4988c4] uppercase tracking-wide">
              Address Preview
            </p>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[#4988c4]" />
              </div>

              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {fullAddressPreview ||
                  "Your complete address will appear here..."}
              </p>
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
              variant="premium"
              size="premiumLg"
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              <MapPin className="h-4 w-4" />
              <span>{initialData ? "Save Changes" : "Save Address"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
