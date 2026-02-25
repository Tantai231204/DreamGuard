import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Image,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReviewSummaryProps } from "./types";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export default function ReviewSummary({
  previewUrls,
  description,
  customerName,
  customerPhone,
  customerEmail,
  address,
  preferredDate,
  preferredTime,
}: ReviewSummaryProps) {
  const fullAddress = [
    address.street,
    address.ward,
    address.district,
    address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Price Notice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4"
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 flex-shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900">
            Price will be quoted after review
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            Our team will evaluate your request and send you a detailed quote
            within <strong>24 hours</strong>.
          </p>
        </div>
      </motion.div>

      {/* Images Section */}
      <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Image className="h-4 w-4 text-[#4988c4]" />
                Uploaded Images
              </span>
              <Badge>{previewUrls.length} photos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previewUrls.map((url, index) => (
                <motion.img
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="h-24 w-24 rounded-lg object-cover flex-shrink-0 hover:scale-105 transition-transform cursor-pointer shadow-sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Description Section */}
      <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-[#4988c4]" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
              {description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Section (if provided) */}
      {(preferredDate || preferredTime) && (
        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-[#4988c4]" />
                Preferred Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {preferredDate && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#bde8f5]/50">
                      <CalendarDays className="h-4 w-4 text-[#4988c4]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium text-gray-900">{preferredDate}</p>
                    </div>
                  </div>
                )}
                {preferredTime && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#bde8f5]/50">
                      <Clock className="h-4 w-4 text-[#4988c4]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Time</p>
                      <p className="font-medium text-gray-900">{preferredTime}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Information */}
      <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-[#4988c4]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium text-gray-900">{customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900">{customerPhone}</p>
                </div>
              </div>
            </div>

            {customerEmail && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-900">{customerEmail}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Pickup Address</p>
                <p className="font-medium text-gray-900">{fullAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
