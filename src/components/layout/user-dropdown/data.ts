import type { BabyProfile, UserInfo } from "./types"

export const mockBabies: BabyProfile[] = [
    { id: "1", name: "Nguyễn Bảo Ngọc", nickname: "Bé Bông", birthDate: "2024-03-15", gender: "girl" },
    { id: "2", name: "Nguyễn Minh Khang", nickname: "Bé Bin", birthDate: "2025-08-20", gender: "boy" },
]

export const mockUser: UserInfo = {
    name: "Nguyễn Thị Minh Anh",
    email: "minhanh@email.com",
    points: 150,
    rank: "Hạng Bạc"
}
