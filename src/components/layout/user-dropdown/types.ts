export interface BabyProfile {
    id: string
    name: string
    nickname: string
    birthDate: string
    gender: "boy" | "girl"
}

export interface MenuItemProps {
    to: string
    icon: React.ReactNode
    iconBg: string
    title: string
    subtitle?: string
    badge?: string | number
    badgeColor?: string
}

export interface BenefitItemProps {
    icon: React.ReactNode
    text: string
}

export interface UserInfo {
    name: string
    email: string
    points: number
    rank: string
}
