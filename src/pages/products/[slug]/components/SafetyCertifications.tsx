import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SafetyCertification } from '../types';

interface SafetyCertificationsProps {
    certifications: SafetyCertification[];
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: custom * 0.1 }
    })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export const SafetyCertifications = memo(({ certifications }: SafetyCertificationsProps) => {
    return (
        <motion.section
            className="mt-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="mb-8 text-center">
                <Badge className="mb-3 bg-green-100 text-green-700">
                    <ShieldCheck className="mr-1 h-4 w-4" />
                    Safe for Your Baby
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900">
                    International Safety Certifications
                </h2>
                <p className="mt-2 text-gray-600">
                    Products meet the highest safety standards for children
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {certifications.map((cert, index) => (
                    <motion.div
                        key={cert.id}
                        variants={fadeInUp}
                        custom={index}
                    >
                        <Card className={cn(
                            "group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
                            cert.borderColor,
                            cert.bgColor
                        )}>
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                                        cert.iconColor
                                    )}>
                                        <cert.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                        <p className="text-sm font-medium text-gray-600">{cert.fullName}</p>
                                        <p className="mt-1 text-xs text-gray-500">{cert.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Additional Safety Info */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">100% Safety Guaranteed</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            All DreamGuard products are rigorously tested and meet international safety certifications.
                            Free from formaldehyde, allergens, and harmful dyes. Absolutely safe for your baby's sensitive skin.
                        </p>
                    </div>
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        Learn More
                    </Button>
                </div>
            </div>
        </motion.section>
    );
});

SafetyCertifications.displayName = 'SafetyCertifications';
