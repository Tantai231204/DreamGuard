import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ProductNotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
            <p className="mt-2 text-gray-500">
                The product you're looking for doesn't exist.
            </p>
            <Button
                className="mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                onClick={() => navigate(-1)}
            >
                Go Back
            </Button>
        </div>
    );
};
