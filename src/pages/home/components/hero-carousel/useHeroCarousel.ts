import { useCallback, useEffect, useState, useMemo, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from 'embla-carousel-autoplay'

export function useHeroCarousel() {
    const autoplayPlugin = useMemo(
        () => Autoplay({ delay: 6000, stopOnInteraction: false }),
        []
    )

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 30, skipSnaps: false },
        [autoplayPlugin]
    )

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [sweepKey, setSweepKey] = useState(0)
    const prevIndexRef = useRef(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        const newIndex = emblaApi.selectedScrollSnap()
        if (newIndex !== prevIndexRef.current) {
            prevIndexRef.current = newIndex
            setSweepKey(pk => pk + 1)
        }
        setSelectedIndex(newIndex)
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)
        emblaApi.on("reInit", onSelect)
        return () => {
            emblaApi.off("select", onSelect)
            emblaApi.off("reInit", onSelect)
        }
    }, [emblaApi, onSelect])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

    return {
        emblaRef,
        selectedIndex,
        sweepKey,
        scrollPrev,
        scrollNext,
        scrollTo
    }
}
