import { motion } from "framer-motion";
import { Check, Clock, Info, RefreshCcw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SuccessStateProps } from "./types";

export default function SuccessState({ contactInfo, onReset }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-lg mx-auto text-center py-8"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mx-auto mb-8"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-green-400/20 animate-ping" />
        </div>
        
        {/* Main circle */}
        <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto shadow-lg shadow-green-200">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>
        </div>

        {/* Sparkles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="h-6 w-6 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        Request Submitted Successfully!
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-500 mb-8 leading-relaxed px-4"
      >
        Our team will review your request and images. We'll contact you with a
        detailed price estimate and available schedule.
      </motion.p>

      {/* Timeline Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-5">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Response Time</span>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Within 24 hours
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="mb-8 border-gray-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Info className="h-4 w-4 text-gray-400" />
              Confirmation will be sent to:
            </div>
            <p className="font-medium text-gray-900 mt-1">{contactInfo}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Submit Another Request
        </Button>
      </motion.div>
    </motion.div>
  );
}
