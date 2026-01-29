/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 1) return "Sơ sinh"
    if (months < 12) return `${months} tháng`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} tuổi`
    return `${years}t ${remainingMonths}th`
}

/**
 * Get gender-based styles for baby cards
 */
export function getGenderStyles(gender: "boy" | "girl"): string {
    return gender === "girl"
        ? "bg-pink-50 text-pink-600 border-pink-200"
        : "bg-sky-50 text-sky-600 border-sky-200"
}
