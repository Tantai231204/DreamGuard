import { memo, useMemo } from 'react';
import type { Combo } from "../../types";
import { ColorSelector } from "../../../products/[slug]/components/ColorSelector";
import { SizeSelector } from "../../../products/[slug]/components/SizeSelector";

interface ComboVariantsProps {
    combo: Combo;
    activeCombo: Combo | null;
    selectedVariantId: string | null;
    onSelectVariant: (id: string) => void;
}

export const ComboVariants = memo(({
    combo,
    activeCombo,
    selectedVariantId,
    onSelectVariant
}: ComboVariantsProps) => {
    const allVariants = useMemo(() => {
        return combo.childCombos || [];
    }, [combo.childCombos]);

    // Format Color Options
    const colorOptions = useMemo(() => {
        const colors = new Map<string, { label: string; value: string; color: string }>();
        allVariants.forEach(v => {
            const key = v.color.toLowerCase();
            if (!colors.has(key)) {
                // Fallback color mapping if it's just a string like "Cream"
                const hexMap: Record<string, string> = {
                    cream: "#F5F5DC", pink: "#FFB6C1", blue: "#87CEEB",
                    mint: "#98FB98", white: "#FFFFFF", gray: "#D1D5DB",
                };
                colors.set(key, {
                    label: v.color,
                    value: v.color,
                    color: hexMap[key] || v.color.toLowerCase()
                });
            }
        });
        return Array.from(colors.values());
    }, [allVariants]);

    const currentColor = activeCombo?.color || combo.color;

    // Format Size Options for current color
    const sizeOptions = useMemo(() => {
        return allVariants
            .filter(v => v.color === currentColor)
            .map(v => ({
                value: v.id,
                label: v.size,
                description: "Bundle Option"
            }));
    }, [allVariants, currentColor]);

    const handleColorChange = (colorValue: string) => {
        const firstOfColor = allVariants.find(v => v.color === colorValue);
        if (firstOfColor) onSelectVariant(firstOfColor.id);
    };

    if (allVariants.length <= 1) return null;

    return (
        <div className="space-y-8 pt-4 border-t border-slate-100">
            <ColorSelector
                options={colorOptions}
                selected={currentColor}
                onChange={handleColorChange}
                isCustomizable={false}
            />

            <SizeSelector
                options={sizeOptions}
                selected={selectedVariantId || ""}
                onChange={onSelectVariant}
                isCustomizable={false}
            />
        </div>
    );
});

ComboVariants.displayName = 'ComboVariants';
