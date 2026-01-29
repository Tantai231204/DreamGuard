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
export { BabyQuickCard } from "./BabyQuickCard";
export { BabiesSection } from "./BabiesSection";
export { RecommendationCard } from "./RecommendationCard";
export { LogoutButton } from "./LogoutButton";
export { AuthButtons } from "./AuthButtons";

// Types
export type {
  BabyProfile,
  MenuItemProps,
  BenefitItemProps,
  UserInfo,
} from "./types";

// Utils
export { calculateAge, getGenderStyles } from "./utils";

// Data
export { mockBabies, mockUser } from "./data";
