export function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    
    if (months < 1) return "Sơ sinh"
    if (months < 12) return `${months} tháng tuổi`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} tuổi`
    return `${years} tuổi ${remainingMonths} tháng`
}

export function getAgeInMonths(birthDate: string): number {
    const birth = new Date(birthDate)
    const now = new Date()
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

export function getStageInfo(birthDate: string): { name: string; color: string; tips: string } {
    const months = getAgeInMonths(birthDate)
    
    if (months < 3) return { 
        name: "Giai đoạn sơ sinh", 
        color: "from-pink-400 to-rose-400",
        tips: "Cần nệm êm ái, chăn mỏng nhẹ"
    }
    if (months < 6) return { 
        name: "Giai đoạn 3-6 tháng", 
        color: "from-purple-400 to-violet-400",
        tips: "Nệm có độ cứng vừa phải, gối định hình đầu"
    }
    if (months < 12) return { 
        name: "Giai đoạn 6-12 tháng", 
        color: "from-blue-400 to-cyan-400",
        tips: "Nệm hỗ trợ lật người, ga giường dễ giặt"
    }
    if (months < 24) return { 
        name: "Giai đoạn 1-2 tuổi", 
        color: "from-green-400 to-emerald-400",
        tips: "Nệm size lớn hơn, chăn ga họa tiết bé thích"
    }
    if (months < 36) return { 
        name: "Giai đoạn 2-3 tuổi", 
        color: "from-yellow-400 to-amber-400",
        tips: "Có thể chuyển sang giường nhỏ"
    }
    return { 
        name: "Trên 3 tuổi", 
        color: "from-orange-400 to-red-400",
        tips: "Giường đơn cho bé, nệm hỗ trợ cột sống"
    }
}

export function formatPrice(price: number): string {
    return price.toLocaleString("vi-VN") + "₫"
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN")
}
