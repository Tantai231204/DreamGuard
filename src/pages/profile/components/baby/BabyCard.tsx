
import { Baby, Heart, Moon } from "lucide-react";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Badge } from "../../../../components/ui/badge";
import { calculateAge, getStageInfo } from "../../utils";
import type { BabyProfile } from "@/api/types/babyProfile";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";

interface BabyCardProps {
  baby: BabyProfile;
  onEdit: (baby: BabyProfile) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function BabyCard({ baby, onEdit, onDelete, isDeleting }: BabyCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const stage = getStageInfo(baby.dateOfBirth);
  const isBoy = baby.gender === "male";

  return (
    <>
      <div
        className="group relative rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-in fade-in"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`relative w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${isBoy
                  ? "bg-blue-50 text-blue-500"
                  : "bg-pink-50 text-pink-500"
                  }`}
              >
                <Baby className="h-6 w-6" />
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${isBoy ? "bg-blue-400" : "bg-pink-400"
                    }`}
                >
                  <Heart className="h-2.5 w-2.5 text-white fill-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {baby.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 h-4 border-none ${isBoy
                      ? "bg-blue-100/50 text-blue-600"
                      : "bg-pink-100/50 text-pink-600"
                      }`}
                  >
                    {baby.gender}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {calculateAge(baby.dateOfBirth)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#4988c4] hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                onClick={() => onEdit(baby)}
              >
                <Pencil1Icon className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isDeleting}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Height", value: baby.height, unit: "cm" },
              { label: "Weight", value: baby.weight, unit: "kg" },
              {
                label: "Birth",
                value: new Date(baby.dateOfBirth).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }),
                unit: ""
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-50/80 rounded-xl p-3 border border-slate-100/50"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  {stat.value}
                  <span className="text-[10px] font-medium text-slate-400 ml-0.5">
                    {stat.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Stage Info */}
          <div className="mt-4 p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 flex items-start gap-3">
            <Moon className="h-4 w-4 text-[#4988c4] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#4988c4] uppercase tracking-wider">{stage.name}</p>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed line-clamp-2">{stage.tips}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Delete Confirmation Dialogue wrapper layout */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <TrashIcon className="h-6 w-6" />
            </div>
            <DialogHeader className="text-center items-center">
              <DialogTitle className="text-base font-bold text-slate-800">Delete Baby Profile?</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-1">
                Are you sure you want to delete <b>{baby.name}</b>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-4 bg-slate-50 flex gap-2 sm:justify-center border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-10 rounded-xl font-bold text-slate-500 hover:bg-white shadow-none text-xs"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-none border-none"
              disabled={isDeleting}
              onClick={() => {
                onDelete(baby.babyId);
                setShowConfirmDelete(false);
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
