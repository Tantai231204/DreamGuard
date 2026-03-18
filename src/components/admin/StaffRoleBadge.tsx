import { cn } from "@/lib/utils";
import { User, ShieldCheck } from "lucide-react";

interface RoleConfigType {
  label: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
  iconSrc?: string;
  fallbackIcon?: React.ReactNode;
}

const roleConfig: Record<string, RoleConfigType> = {
  Manager: {
    label: "Manager",
    bgColor: "bg-indigo-600",
    textColor: "text-white",
    iconColor: "bg-indigo-600",
    borderColor: "border-transparent",
    glowColor: "shadow-[0_4px_12px_rgba(79,70,229,0.25)]",
    iconSrc: "/images/manager.svg",
  },
  Seller: {
    label: "Seller",
    bgColor: "bg-emerald-600",
    textColor: "text-white",
    iconColor: "bg-emerald-600",
    borderColor: "border-transparent",
    glowColor: "shadow-[0_4px_12px_rgba(5,150,105,0.25)]",
    iconSrc: "/images/seller.svg",
  },
  CleaningStaff: {
    label: "Cleaning Staff",
    bgColor: "bg-amber-500",
    textColor: "text-white",
    iconColor: "bg-amber-500",
    borderColor: "border-transparent",
    glowColor: "shadow-[0_4px_12px_rgba(245,158,11,0.25)]",
    iconSrc: "/images/cleanning-staff.svg",
  },
  Admin: {
    label: "Admin",
    bgColor: "bg-rose-600",
    textColor: "text-white",
    iconColor: "bg-rose-600",
    borderColor: "border-transparent",
    glowColor: "shadow-[0_4px_12px_rgba(225,29,72,0.25)]",
    fallbackIcon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
};

const defaultConfig: RoleConfigType = {
  label: "Staff",
  bgColor: "bg-gray-600",
  textColor: "text-white",
  iconColor: "bg-gray-600",
  borderColor: "border-transparent",
  glowColor: "shadow-[0_4px_12px_rgba(107,114,128,0.25)]",
  fallbackIcon: <User className="w-3.5 h-3.5" />,
};

interface StaffRoleBadgeProps {
  role: string | undefined;
  className?: string;
}

export function StaffRoleBadge({ role, className }: StaffRoleBadgeProps) {
  const resolvedRole = role || 'Staff';

  const match = Object.keys(roleConfig).find(
    key => key.toLowerCase() === resolvedRole.toLowerCase()
  );

  const config = match ? roleConfig[match] : {
    ...defaultConfig,
    label: resolvedRole.charAt(0).toUpperCase() + resolvedRole.slice(1).toLowerCase()
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border shadow-md transition-all hover:translate-y-[-1px] select-none group cursor-default text-[12px] font-black tracking-wide",
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.glowColor,
        className
      )}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)] flex-shrink-0 transition-transform group-hover:scale-105">
        {config.iconSrc ? (
          <div
            className={cn("w-3.5 h-3.5 transition-transform group-hover:rotate-3", config.iconColor)}
            style={{
              maskImage: `url(${config.iconSrc})`,
              maskSize: 'contain',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: `url(${config.iconSrc})`,
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat'
            }}
          />
        ) : (
          <div className={cn("transition-transform group-hover:rotate-3 flex items-center justify-center", config.iconColor.replace('bg-', 'text-'))}>
            {config.fallbackIcon}
          </div>
        )}
      </div>
      <span className="font-extrabold">{config.label}</span>
    </div>
  );
}
