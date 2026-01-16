import { ArrowRight } from "lucide-react";

interface CategoryItem {
    id: number;
    name: string;
    image: string;
}

const categories: CategoryItem[] = [
    {
        id: 1,
        name: "Mattress",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=450&fit=crop",
    },
    {
        id: 2,
        name: "Pillow",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=450&fit=crop",
    },
    {
        id: 3,
        name: "Blanket",
        image: "https://images.unsplash.com/photo-1616627577420-a416cd6ba3f3?w=300&h=300&fit=crop",
    },
    {
        id: 4,
        name: "Bed sheet",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=300&fit=crop",
    },
];

export default function CategorySection() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto max-w-5xl px-4">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-1.5">
                        Help your baby sleep better with DreamGuard.
                    </h2>
                    <p className="text-sm text-gray-600">
                        Rubaby products are specially designed for babies.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
                    <LargeCard {...categories[0]} />
                    <LargeCard {...categories[1]} />

                    <div className="grid grid-rows-2 gap-5 h-full">
                        <SmallCard {...categories[2]} />
                        <SmallCard {...categories[3]} />
                    </div>
                </div>

                {/* Button */}
                <div className="flex justify-center">
                    <button className="
                        flex items-center gap-2
                        px-6 py-2.5
                        border border-[var(--color-primary)]
                        text-[var(--color-primary)]
                        text-sm font-medium
                        rounded-md
                        hover:bg-[var(--color-primary)]
                        hover:text-white
                        transition
                        shadow-sm
                    ">
                        Show all Category
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ===================== */
/* COMPONENTS */
/* ===================== */

function LargeCard({ name, image }: CategoryItem) {
    return (
        <div className="
            group relative
            rounded-2xl
            bg-white
border border-gray-200
shadow-[0_2px_6px_rgba(0,0,0,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]
            cursor-pointer
        ">
            <div className="p-2.5">
                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="
                            w-full h-full object-cover
                            transition-transform duration-500
                            group-hover:scale-105
                        "
                    />
                </div>
            </div>

            {/* Overlay */}
            <div className="
                absolute bottom-4 left-1/2 -translate-x-1/2
                bg-white/95 backdrop-blur
                px-4 py-1.5
                rounded-lg
                border border-gray-200/70
                shadow-sm
                transition-all duration-300
                group-hover:-translate-y-1
            ">
                <span className="text-sm font-semibold text-gray-800">
                    {name}
                </span>
            </div>
        </div>
    );
}


function SmallCard({ name, image }: CategoryItem) {
    return (
        <div className="
            group h-full
            flex items-center gap-4
            rounded-xl
            bg-white
            border border-gray-200
            shadow-[0_1px_2px_rgba(0,0,0,0.06)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]
            cursor-pointer
            px-4
        ">
            {/* Image */}
            <div className="
                w-16 h-16
                rounded-lg
                bg-gray-50
                border border-gray-200/70
                overflow-hidden
                flex items-center justify-center
                flex-shrink-0
            ">
                <img
                    src={image}
                    alt={name}
                    className="
                        w-full h-full object-cover
                        transition-transform duration-500
                        group-hover:scale-110
                    "
                />
            </div>

            {/* Text */}
            <div className="flex flex-col justify-center">
                <span className="text-sm font-semibold text-gray-800">
                    {name}
                </span>
                <span className="text-xs text-gray-500">
                    Explore collection
                </span>
            </div>
        </div>
    );
}


