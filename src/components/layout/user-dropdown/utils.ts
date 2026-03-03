// Get baby's age from birthdate
export function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 1) return "Newborn"
    if (months < 12) return `${months} mo`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years}y`
    return `${years}y ${remainingMonths}m`
}

// Color scheme based on baby's gender
export function getGenderStyles(gender: "boy" | "girl"): string {
    return gender === "girl"
        ? "bg-gradient-to-br from-pink-100 to-rose-50 text-pink-500 border-0"
        : "bg-gradient-to-br from-sky-100 to-blue-50 text-sky-500 border-0"
}
