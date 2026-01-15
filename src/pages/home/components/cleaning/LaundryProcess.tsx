import * as AspectRatio from "@radix-ui/react-aspect-ratio";

interface LaundryProcessProps {
    processes: string[];
}

export default function LaundryProcess({ processes }: LaundryProcessProps) {
    return (
        <div className="bg-white border border-dashed border-[var(--color-cleaning-border)] rounded-lg p-5 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Image Side */}
                <div className="relative">
                    <AspectRatio.Root ratio={4 / 3}>
                        <div className="rounded-lg overflow-hidden bg-gray-100 w-full h-full">
                            <img
                                src="/api/placeholder/500/375"
                                alt="Professional Laundry"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </AspectRatio.Root>
                    <button className="absolute bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-[var(--color-cleaning-booking-btn)] text-[var(--color-cleaning-booking-text)] text-xs font-medium rounded-full hover:opacity-90 transition-opacity shadow-sm">
                        Booking now
                    </button>
                </div>

                {/* Process Steps */}
                <div>
                    <h3 className="text-base font-semibold text-[var(--color-cleaning-process-title)] mb-3">
                        Professional Laundry Process
                    </h3>
                    <ul className="space-y-2">
                        {processes.map((process, index) => (
                            <li
                                key={index}
                                className="flex items-start text-xs text-[var(--color-cleaning-process-text)]"
                            >
                                <span className="text-[var(--color-cleaning-featured-border)] mr-2">•</span>
                                <span>{process}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
