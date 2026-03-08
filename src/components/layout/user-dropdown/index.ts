// Main component
export { default as UserDropdown } from "./UserDropdown";

// Sub-components
export { TriggerButton } from "./TriggerButton";
export { GuestDropdownContent } from "./GuestDropdownContent";
export { UserDropdownContent } from "./UserDropdownContent";
export { UserHeader } from "./UserHeader";
export { GuestHeader } from "./GuestHeader";
export { MenuItem } from "./MenuItem";
export { BenefitItem } from "./BenefitItem";
export { LogoutButton } from "./LogoutButton";
export { AuthButtons } from "./AuthButtons";

// Types
export type {
  MenuItemProps,
  BenefitItemProps,
  UserInfo,
} from "./types";

// Data
export { mockUser } from "./data";
