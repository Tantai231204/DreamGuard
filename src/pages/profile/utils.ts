
export function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 1) return "Newborn"
    if (months < 12) return `${months} months old`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} years old`
    return `${years} years ${remainingMonths} months`
}

export function getAgeInMonths(birthDate: string): number {
    const birth = new Date(birthDate)
    const now = new Date()
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

export function getStageInfo(birthDate: string): { name: string; color: string; tips: string } {
    const months = getAgeInMonths(birthDate)

    if (months < 3) return {
        name: "Newborn Stage",
        color: "from-pink-400 to-rose-400",
        tips: "Needs soft mattress, lightweight blanket"
    }
    if (months < 6) return {
        name: "3-6 Months Stage",
        color: "from-purple-400 to-violet-400",
        tips: "Medium firm mattress, head-shaping pillow"
    }
    if (months < 12) return {
        name: "6-12 Months Stage",
        color: "from-blue-400 to-cyan-400",
        tips: "Mattress supports rolling over, easy-to-wash sheets"
    }
    if (months < 24) return {
        name: "1-2 Years Stage",
        color: "from-green-400 to-emerald-400",
        tips: "Larger mattress, favorite bedsheet patterns"
    }
    if (months < 36) return {
        name: "2-3 Years Stage",
        color: "from-yellow-400 to-amber-400",
        tips: "Can transition to a toddler bed"
    }
    return {
        name: "Over 3 Years",
        color: "from-orange-400 to-red-400",
        tips: "Single bed, spine-supporting mattress"
    }
}

export { formatDate, formatPrice, formatDateTime, formatTime } from '@/lib/utils';
