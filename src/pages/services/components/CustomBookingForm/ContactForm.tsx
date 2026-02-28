import { CalendarDays, Mail, MapPin, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { timeSlots } from "../../data";
import type { ContactFormProps, ContactFormData } from "./types";

export default function ContactForm({
    customerName,
    customerPhone,
    customerEmail,
    address,
    preferredDate,
    preferredTime,
    onFieldChange,
    onAddressChange,
}: ContactFormProps) {
    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-white border-b">
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-g gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-900">Personal Information</div>
                            <CardDescription className="text-xs mt-0.5">
                                We'll use this information to contact you about your request
                            </CardDescription>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="name" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                <User className="h-4 w-4 text-[var(--color-primary)]" />
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={customerName}
                                onChange={(e) => onFieldChange("customerName" as keyof ContactFormData, e.target.value)}
                                placeholder="John Doe"
                                className="h-11 border-2 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-100 transition-all"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="phone" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                value={customerPhone}
                                onChange={(e) => onFieldChange("customerPhone" as keyof ContactFormData, e.target.value)}
                                placeholder="+84 (xxx) xxx-xxx"
                                className="h-11 border-2 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-100 transition-all"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="email" className="flex items-center gap-1.5 font-semibold text-gray-700">
                            <Mail className="h-4 w-4 text-[var(--color-primary)]" />
                            Email
                            <Badge variant="outline" className="ml-2 text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                For quote
                            </Badge>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => onFieldChange("customerEmail" as keyof ContactFormData, e.target.value)}
                            placeholder="john@example.com"
                            className="h-11 border-2 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </motion.div>
                </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/20">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-white border-b">
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-900">Pickup Address</div>
                            <CardDescription className="text-xs mt-0.5">
                                Where should we pickup your items?
                            </CardDescription>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="street" className="font-semibold text-gray-700">
                            Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="street"
                            value={address.street}
                            onChange={(e) => onAddressChange("street", e.target.value)}
                            placeholder="123 Main St, Apt 4"
                            className="h-11 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-3 gap-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="ward" className="text-sm font-medium text-gray-600">
                                Ward
                            </Label>
                            <Input
                                id="ward"
                                value={address.ward}
                                onChange={(e) => onAddressChange("ward", e.target.value)}
                                placeholder="Ward"
                                className="h-10 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district" className="text-sm font-medium text-gray-600">
                                District <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="district"
                                value={address.district}
                                onChange={(e) => onAddressChange("district", e.target.value)}
                                placeholder="District"
                                className="h-10 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                                City <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="city"
                                value={address.city}
                                onChange={(e) => onAddressChange("city", e.target.value)}
                                placeholder="Enter your city"
                                className="h-10 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            />
                        </div>
                    </motion.div>
                </CardContent>
            </Card>

            {/* Preferred Schedule */}
            <Card className="bg-gradient-to-br from-white to-purple-50/20 border-purple-100/50">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <CalendarDays className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-800">
                                    Preferred Schedule
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Let us know your preferred pickup time
                                </CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">Optional</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, staggerChildren: 0.1 }}
                        className="grid sm:grid-cols-2 gap-6"
                    >
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                                Preferred Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={preferredDate}
                                onChange={(e) => onFieldChange("preferredDate" as keyof ContactFormData, e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="h-11 border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                            />
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                                Preferred Time
                            </Label>
                            <select
                                id="time"
                                value={preferredTime}
                                onChange={(e) => onFieldChange("preferredTime" as keyof ContactFormData, e.target.value)}
                                className="flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                            >
                                <option value="">Select a time slot</option>
                                {timeSlots.map((ts) => (
                                    <option key={ts} value={ts}>
                                        {ts}
                                    </option>
                                ))}
                            </select>
                        </motion.div>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    );
}
