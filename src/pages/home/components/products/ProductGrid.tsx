import type { Product } from './productData'
import ProductCard from './ProductCard'

interface ProductGridProps {
    products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}
