
export interface MenuItemProps {
    to: string
    icon: React.ReactNode
    title: string
    badge?: string | number
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
    avatarUrl?: string
}
