import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SectionHeading } from './Sectionheading';


type StatusVariant = 'success' | 'warning' | 'outline' | 'danger';

interface QuickInfoCardProps {
    status: string;
    statusVariant: StatusVariant;
    cateId?: string | number;
    variantCount?: number;
    minPrice?: number;
    maxPrice?: number;
    productId: string;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-400 font-medium">{label}</span>
            <div className="font-semibold text-gray-800">{children}</div>
        </div>
    );
}

function QuickInfoCard({
    status,
    statusVariant,
    cateId,
    variantCount,
    minPrice,
    maxPrice,
    productId,
}: QuickInfoCardProps) {
    return (
        <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
            {/* Top accent strip */}
            <div className="h-[3px] bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-hover)] to-transparent" />

            <div className="p-5">
                <SectionHeading label="Quick Info" />

                <div className="space-y-3.5">
                    <Row label="Status">
                        <Badge variant={statusVariant} className="font-semibold text-xs px-2 py-0.5">
                            {status}
                        </Badge>
                    </Row>

                    <Separator className="bg-gray-50" />

                    <Row label="Category">
                        <span>{cateId ?? '—'}</span>
                    </Row>

                    <Separator className="bg-gray-50" />

                    <Row label="Variants">
                        <span className="text-[var(--color-primary)]">{variantCount ?? 0}</span>
                    </Row>

                    {(minPrice != null || maxPrice != null) && (
                        <>
                            <Separator className="bg-gray-50" />
                            <Row label="Price Range">
                                <span className="text-[13px]">
                                    {minPrice?.toLocaleString('vi-VN')}₫&thinsp;—&thinsp;{maxPrice?.toLocaleString('vi-VN')}₫
                                </span>
                            </Row>
                        </>
                    )}

                    <Separator className="bg-gray-50" />

                    <Row label="Product ID">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(productId)}
                                        className="font-mono text-[11px] text-gray-400 hover:text-[var(--color-primary)] transition-colors truncate max-w-[140px]"
                                    >
                                        {productId.slice(0, 8)}…
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p className="font-mono text-xs">{productId}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Row>
                </div>
            </div>
        </Card>
    );
}

export default QuickInfoCard;