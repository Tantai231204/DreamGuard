import { ArrowLeft, Check, ChevronRight } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui/card"
import { Button } from "../../../../../components/ui/button"
import ProgressSteps from "./ProgressSteps"
import ProductSelection from "./ProductSelection"
import MediaUpload from "./ConditionAssessment"
import Confirmation from "./Confirmation"
import type { EligibleProduct, MediaFile, SelectedProductWithMedia } from "../types"

interface CreateWizardProps {
    step: number
    products: EligibleProduct[]
    selectedProducts: EligibleProduct[]
    productsWithMedia: SelectedProductWithMedia[]
    agreedTerms: boolean
    onToggleProduct: (product: EligibleProduct) => void
    onSelectAll: () => void
    onDeselectAll: () => void
    onUpdateProductMedia: (productId: string, media: MediaFile[], note: string) => void
    onToggleTerms: (agreed: boolean) => void
    onStepChange: (step: number) => void
    onCancel: () => void
    onSubmit: () => void
}

export default function CreateWizard({
    step,
    products,
    selectedProducts,
    productsWithMedia,
    agreedTerms,
    onToggleProduct,
    onSelectAll,
    onDeselectAll,
    onUpdateProductMedia,
    onToggleTerms,
    onStepChange,
    onCancel,
    onSubmit,
}: CreateWizardProps) {
    const handleBack = () => {
        if (step === 1) {
            onCancel()
        } else {
            onStepChange(step - 1)
        }
    }

    const handleNext = () => {
        if (step < 3) {
            onStepChange(step + 1)
        } else {
            onSubmit()
        }
    }

    // Validation for each step
    const hasAnyMedia = productsWithMedia.some(p => p.media.length > 0)
    
    const isNextDisabled = 
        (step === 1 && selectedProducts.length === 0) ||
        (step === 2 && !hasAnyMedia) ||
        (step === 3 && !agreedTerms)

    const getNextButtonText = () => {
        if (step === 3) return "Gửi yêu cầu"
        if (step === 2 && !hasAnyMedia) return "Thêm ít nhất 1 ảnh/video"
        return "Tiếp tục"
    }

    return (
        <Card className="overflow-hidden">
            <ProgressSteps currentStep={step} />

            <CardContent className="p-6">
                {/* Step 1: Select Products (Multi-select) */}
                {step === 1 && (
                    <ProductSelection
                        products={products}
                        selectedProducts={selectedProducts}
                        onToggleProduct={onToggleProduct}
                        onSelectAll={onSelectAll}
                        onDeselectAll={onDeselectAll}
                    />
                )}

                {/* Step 2: Media Upload */}
                {step === 2 && (
                    <MediaUpload
                        selectedProducts={selectedProducts}
                        productsWithMedia={productsWithMedia}
                        onUpdateProductMedia={onUpdateProductMedia}
                    />
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <Confirmation
                        productsWithMedia={productsWithMedia}
                        agreedTerms={agreedTerms}
                        onToggleTerms={onToggleTerms}
                    />
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {step === 1 ? "Hủy" : "Quay lại"}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={isNextDisabled}
                        className="bg-gradient-to-r from-[#4988c4] to-[#3a73a8]"
                    >
                        {step === 3 ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Gửi yêu cầu
                            </>
                        ) : (
                            <>
                                {getNextButtonText()}
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
