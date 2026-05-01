import { memo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bell,
  Baby,
  User,
  Heart,
  Lock,
  LogOut,
  Ticket,
  ShoppingBag,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { TabId, Tab } from "../types";
import { useLogout } from "../../../hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/uploadCloudinary";
import { toast } from "sonner";
import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";

const MotionButton = motion.create(Button);

const TABS: Tab[] = [
  {
    id: "profile",
    label: "My Profile",
    icon: <User className="h-4.5 w-4.5" />,
  },
  {
    id: "babies",
    label: "My Babies",
    icon: <Baby className="h-4.5 w-4.5" />,
    badge: 2,
  },
  {
    id: "orders",
    label: "Recent Orders",
    icon: <ShoppingBag className="h-4.5 w-4.5" />,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: <Heart className="h-4.5 w-4.5" />,
  },
  {
    id: "vouchers",
    label: "Vouchers",
    icon: <Ticket className="h-4.5 w-4.5" />,
    badge: 3,
  },
  {
    id: "addresses",
    label: "Shipping Addresses",
    icon: <MapPin className="h-4.5 w-4.5" />,
  },
  {
    id: "security",
    label: "Account Security",
    icon: <Lock className="h-4.5 w-4.5" />,
  },
  {
    id: "trade-in-orders",
    label: "Trade-In Orders",
    icon: <ArrowLeftRight className="h-4.5 w-4.5" />,
  },
];

interface ProfileSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const ProfileSidebar = ({ activeTab, onTabChange }: ProfileSidebarProps) => {
  const logoutMutation = useLogout();
  const { data: profile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const [isUploading, setIsUploading] = useState(false);
  const normalized = profile;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!profile) {
      toast.error("Profile data is not ready. Please try again.");
      return;
    }

    const email = profile.email?.trim();
    const gender = profile.gender?.trim();

    if (!email || !gender) {
      toast.error("Please update email and gender before changing avatar.");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadToCloudinary(file);
      const avatarUrl = res.secure_url;
      
      updateProfile({
        fullName: profile.fullName || displayName,
        email,
        gender,
        dateOfBirth: profile.dateOfBirth,
        avatarUrl 
      }, {
        onSuccess: () => {
          toast.success("Avatar updated successfully");
        },
        onError: () => {
          toast.error("Failed to update avatar");
        },
        onSettled: () => {
          setIsUploading(false);
        }
      });
    } catch {
      toast.error("Upload failed");
      setIsUploading(false);
    }
  };

  const displayName = normalized?.fullName || "Valued Member";

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* User Profile */}
      <div className="relative pt-8 pb-8 px-6 group shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-5">
            <input
              type="file"
              id="sidebar-avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white to-slate-100 p-1 ring-1 ring-slate-200 shadow-xl transition-all duration-500 group/avatar overflow-hidden">
              <div className="w-full h-full rounded-[1.75rem] overflow-hidden bg-white flex items-center justify-center relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className={cn("w-full h-full object-cover transition-opacity", isUploading && "opacity-30")}
                  />
                ) : (
                  <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}

                {/* Hover Overlay / Loading */}
                <button
                  type="button"
                  onClick={() => document.getElementById("sidebar-avatar-upload")?.click()}
                  disabled={isUploading}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-300",
                    isUploading
                      ? "bg-black/20 opacity-100"
                      : "bg-black/40 opacity-0 group-hover/avatar:opacity-100"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-2xl bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            {profile?.firstName || profile?.lastName
              ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
              : profile?.fullName || "Exclusive Member"}
          </h3> */}

          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            {displayName}
          </h3>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100/50 shadow-sm animate-in fade-in zoom-in duration-500">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                <span className="text-[10px] text-white font-black">⌬</span>
              </div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                {profile?.memberCoin ?? 0} <span className="opacity-60 ml-0.5">Coins</span>
              </span>
            </div>
          </div>

          <div className="w-full px-4">
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1 group/coin transition-all hover:bg-white hover:shadow-md">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                Ready to Exchange
              </span>
              <p className="text-[10px] text-slate-600 font-bold text-center leading-relaxed">
                Use your coins to unlock <span className="text-primary font-black">Exclusive Vouchers</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-12" />

      {/* Navigation */}
      <div className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar">
        <div className="px-6 mb-5 flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
            Dashboard Navigation
          </h4>
        </div>

        <nav className="space-y-1.5 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isActive) {
                    onTabChange(tab.id);
                  }
                }}
                className={cn(
                  "relative w-full flex items-center gap-4 rounded-2xl px-5 py-3.5 overflow-hidden group transition-all duration-300 cursor-pointer",
                  !isActive &&
                  "hover:bg-slate-50 text-slate-500 hover:text-slate-900",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary z-0 shadow-[0_8px_20px_-6px_rgba(73,136,196,0.25)] pointer-events-none"
                    style={{ borderRadius: "12px" }}
                    transition={{
                      type: "spring",
                      stiffness: 140,
                      damping: 18,
                      mass: 0.6,
                    }}
                  />
                )}

                <div
                  className={cn(
                    "w-10 h-10 rounded-[0.85rem] flex items-center justify-center relative z-10 transition-all duration-300",
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-md",
                  )}
                >
                  {tab.icon}
                </div>

                <span
                  className={cn(
                    "flex-1 text-left text-[14px] tracking-tight relative z-10 transition-colors",
                    isActive
                      ? "text-white font-bold"
                      : "text-slate-600 font-medium",
                  )}
                >
                  {tab.label}
                </span>

                {tab.badge && (
                  <span
                    className={cn(
                      "min-w-[20px] h-5 flex items-center justify-center text-[9px] font-black px-1.5 rounded-lg relative z-10 transition-transform duration-300 group-hover:scale-110",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto p-6 shrink-0 space-y-4">
        <div className="relative group bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform duration-500">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight text-white">
                  Priority Support
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Available 24/7
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-tight px-1">
              Need assistance with your orders? Our experts are here to help you
              24/7.
            </p>

            {/* Liquid Filling Button */}
            <MotionButton
              whileHover="hover"
              initial="initial"
              className="relative w-full h-12 rounded-xl bg-white text-slate-900 text-[10px] font-black tracking-[0.2em] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 active:scale-[0.98] group overflow-hidden border-none"
            >
              <motion.div
                variants={{
                  initial: { y: "130%", rotate: 0 },
                  hover: {
                    y: "15%",
                    rotate: 360,
                    transition: {
                      y: { duration: 0.8, ease: "easeOut" },
                      rotate: { duration: 4, ease: "linear", repeat: Infinity },
                    },
                  },
                }}
                className="absolute w-[200%] h-[200%] -left-[50%] rounded-[38%] bg-primary z-0"
              />
              <motion.div
                variants={{
                  initial: { y: "140%", rotate: 45 },
                  hover: {
                    y: "25%",
                    rotate: -360,
                    transition: {
                      y: { duration: 0.9, ease: "easeOut" },
                      rotate: { duration: 5, ease: "linear", repeat: Infinity },
                    },
                  },
                }}
                className="absolute w-[200%] h-[200%] -left-[50%] rounded-[35%] bg-primary/30 z-0"
              />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                GET ASSISTANCE
              </span>
            </MotionButton>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-4 rounded-2xl px-5 py-3.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 disabled:opacity-50 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-rose-100/50 transition-colors shadow-sm">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          <span className="text-[14px] font-bold">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default memo(ProfileSidebar);
