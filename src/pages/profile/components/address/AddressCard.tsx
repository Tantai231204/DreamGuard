import { Home, CheckCircle2, Phone, MapPin, Star } from "lucide-react";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "../../../../components/ui/button";
import type { Address } from "../../../../api/types/address";

interface AddressCardProps {
  address: Address;
  isDefault: boolean;
  onSetDefault: (id: string) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({
  address,
  isDefault,
  onSetDefault,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div
      className={`group relative rounded-3xl overflow-hidden transition-all duration-300 ${isDefault
        ? "bg-blue-50/40 border-2 border-[#4988c4]/40 shadow-lg shadow-[#4988c4]/5"
        : "bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60"
        }`}
      style={
        !isDefault
          ? {
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          }
          : undefined
      }
    >
      {/* Accent stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${isDefault
          ? "bg-[#4988c4]"
          : "bg-gray-200 group-hover:bg-[#4988c4]/40 transition-all duration-300"
          }`}
      />
      {/* Default Edge Ribbon */}
      {isDefault && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-[#4988c4] text-white text-[9px] font-black px-4 py-2 rounded-bl-2xl shadow-sm flex items-center gap-1 uppercase tracking-wider leading-none">
            <Star className="h-3 w-3 fill-white" />
            <span>Default</span>
          </div>
        </div>
      )}


      <div className="px-6 pt-6 pb-5">
        {/* Name + Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${isDefault
                ? "bg-[#4988c4] text-white"
                : "bg-gray-50 group-hover:bg-blue-50 transition-colors"
                }`}
            >
              <Home
                className={`h-5 w-5 ${isDefault
                  ? "text-white"
                  : "text-gray-400 group-hover:text-[#4988c4] transition-colors"
                  }`}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {address.receiverName}
            </h3>
            {isDefault && (
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
              onClick={() => onEdit(address)}
            >
              <Pencil1Icon className="h-3.5 w-3.5" />
            </button>
            <button
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
              onClick={() => onDelete(address.addressId)}
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
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isDefault
              ? "bg-blue-50/60 border border-blue-100/80"
              : "bg-gray-50 border border-gray-100"
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
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl ${isDefault
              ? "bg-blue-50/60 border border-blue-100/80"
              : "bg-gray-50 border border-gray-100"
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
              onClick={() => onEdit(address)}
              className="h-8 px-3 text-gray-500 hover:text-[#4988c4] hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold border border-transparent hover:border-blue-100 gap-1.5"
            >
              <Pencil1Icon className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(address.addressId)}
              className="h-8 px-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold border border-transparent hover:border-red-100 gap-1.5"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
          {!isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold text-gray-500 hover:text-[#4988c4] hover:border-[#4988c4]/30 hover:bg-blue-50 rounded-xl transition-all border-gray-200 gap-1.5"
              onClick={() => onSetDefault(address.addressId)}
            >
              <Star className="h-3 w-3" />
              Set Default
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
