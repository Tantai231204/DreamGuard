import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, User } from "lucide-react"
import type { CustomerInfo } from "../types"

interface TradeInCustomerCardProps {
    customer: CustomerInfo
}

export function TradeInCustomerCard({ customer }: TradeInCustomerCardProps) {
    return (
        <Card className="p-5 border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded bg-blue-600">
                    <User className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">
                    Customer Info
                </h2>
            </div>

            {/* Customer Avatar & Name */}
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {customer.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-semibold text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">ID: {customer.id}</div>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm text-gray-800 break-all">{customer.email}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm text-gray-800">{customer.phone}</div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
