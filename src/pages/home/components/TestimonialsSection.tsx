import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";

interface Testimonial {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    review: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Jessica",
        avatar: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        review: "Sagittis vitae et leo duis ut diam quam nulla porttitor massa id neque aliquam"
    },
    {
        id: 2,
        name: "John Smith",
        avatar: "https://i.pravatar.cc/150?img=2",
        rating: 5,
        review: "Sagittis vitae et leo duis ut diam quam nulla porttitor massa id neque aliquam vestibulum"
    },
    {
        id: 3,
        name: "Andrea",
        avatar: "https://i.pravatar.cc/150?img=3",
        rating: 5,
        review: "Sagittis vitae et leo duis ut diam quam nulla porttitor massa id neque"
    },
    {
        id: 4,
        name: "Michael",
        avatar: "https://i.pravatar.cc/150?img=4",
        rating: 5,
        review: "Amazing products! The quality exceeded my expectations and my baby sleeps so much better now."
    },
    {
        id: 5,
        name: "Sarah",
        avatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        review: "Highly recommend! Great customer service and the mattress is incredibly comfortable."
    }
];

export default function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + Math.max(1, testimonials.length - 2)) % Math.max(1, testimonials.length - 2));
    };

    const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

    return (
        <section className="py-12 bg-gradient-to-b from-[var(--color-testimonials-bg-start)] to-[var(--color-testimonials-bg-end)]">
            <div className="container mx-auto max-w-6xl px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-testimonials-title)] mb-1 drop-shadow-sm">
                        Hear from Other Happy Parents
                    </h2>
                    <p className="text-sm text-[var(--color-testimonials-subtitle)]">Customer testimonials</p>
                </div>

                {/* Testimonials Carousel */}
                <div className="relative px-12">
                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-testimonials-button-bg)] border border-[var(--color-testimonials-button-border)] rounded-full p-2 hover:border-[var(--color-testimonials-button-hover-border)] transition-all duration-200"
                        style={{ boxShadow: 'var(--shadow-testimonials-button)' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-button-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-button)'}
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-5 h-5 text-[var(--color-testimonials-button-icon)]" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--color-testimonials-button-bg)] border border-[var(--color-testimonials-button-border)] rounded-full p-2 hover:border-[var(--color-testimonials-button-hover-border)] transition-all duration-200"
                        style={{ boxShadow: 'var(--shadow-testimonials-button)' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-button-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-button)'}
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-5 h-5 text-[var(--color-testimonials-button-icon)]" />
                    </button>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleTestimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="bg-[var(--color-testimonials-card-bg)] border border-[var(--color-testimonials-card-border)] rounded-xl p-5 relative transition-all duration-300 hover:scale-[1.02] flex flex-col min-h-[200px]"
                                style={{ boxShadow: 'var(--shadow-testimonials-card)' }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-card-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-testimonials-card)'}
                            >
                                {/* Quote Icon */}
                                <Quote className="absolute top-3 right-3 w-8 h-8 text-[var(--color-testimonials-quote)]" />

                                {/* Star Rating */}
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-[var(--color-testimonials-star)] text-[var(--color-testimonials-star)] drop-shadow-sm" />
                                    ))}
                                </div>

                                {/* Review Text */}
                                <p className="text-sm text-[var(--color-testimonials-text)] mb-4 leading-relaxed line-clamp-3 flex-grow">
                                    {testimonial.review}
                                </p>

                                {/* Customer Info */}
                                <div className="flex items-center gap-2.5 mt-auto">
                                    <Avatar.Root className="inline-flex h-9 w-9 select-none items-center justify-center overflow-hidden rounded-full bg-[var(--color-testimonials-avatar-bg)] ring-2 ring-[var(--color-testimonials-card-border)] shadow-md">
                                        <Avatar.Image
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="h-full w-full object-cover"
                                        />
                                        <Avatar.Fallback className="text-sm font-medium text-[var(--color-testimonials-avatar-text)]">
                                            {testimonial.name.charAt(0)}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <span className="text-sm font-semibold text-[var(--color-testimonials-name)]">{testimonial.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
