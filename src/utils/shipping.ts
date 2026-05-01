// src/utils/shipping.ts

export type DistanceTier = "under100" | "100-200" | "250" | "300-350" | "400" | "500";

interface ShippingRates {
    base: {
        [key in DistanceTier]: {
            upTo05: number;
            upTo1: number;
            upTo2: number;
            upTo3: number;
        };
    };
    extra: {
        [key in DistanceTier]: {
            above3: number;
            above5: number;
            above10: number;
            above15: number;
            above20: number;
            above40: number;
        };
    };
}

const RATES: ShippingRates = {
    base: {
        under100: { upTo05: 25000, upTo1: 30000, upTo2: 35000, upTo3: 40000 },
        "100-200": { upTo05: 30000, upTo1: 35000, upTo2: 40000, upTo3: 45000 },
        "250": { upTo05: 30000, upTo1: 35000, upTo2: 40000, upTo3: 45000 },
        "300-350": { upTo05: 30000, upTo1: 35000, upTo2: 40000, upTo3: 45000 },
        "400": { upTo05: 35000, upTo1: 40000, upTo2: 45000, upTo3: 50000 },
        "500": { upTo05: 35000, upTo1: 40000, upTo2: 45000, upTo3: 50000 },
    },
    extra: {
        under100: { above3: 1000, above5: 1000, above10: 1000, above15: 1000, above20: 1000, above40: 1000 },
        "100-200": { above3: 1000, above5: 1000, above10: 1500, above15: 1500, above20: 1500, above40: 2000 },
        "250": { above3: 1500, above5: 1500, above10: 1500, above15: 1500, above20: 1500, above40: 2300 },
        "300-350": { above3: 1600, above5: 1600, above10: 1600, above15: 1600, above20: 1600, above40: 2400 },
        "400": { above3: 1600, above5: 1600, above10: 1950, above15: 1950, above20: 1950, above40: 2600 },
        "500": { above3: 1800, above5: 1800, above10: 2100, above15: 2100, above20: 2100, above40: 2800 },
    }
};

const HCMC_COORDS = { lat: 10.762622, lng: 106.660172 };

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
    "79": { lat: 10.762622, lng: 106.660172 }, // TP. Hồ Chí Minh
    "01": { lat: 21.028511, lng: 105.804817 }, // Hà Nội
    "48": { lat: 16.054407, lng: 108.202167 }, // Đà Nẵng
    "31": { lat: 20.844912, lng: 106.688084 }, // Hải Phòng
    "92": { lat: 10.033333, lng: 105.783333 }, // Cần Thơ
    "77": { lat: 10.941936, lng: 106.671234 }, // Bình Dương
    "75": { lat: 10.948232, lng: 106.812234 }, // Đồng Nai
    "80": { lat: 10.5925, lng: 106.6561 },   // Long An
    "72": { lat: 11.3333, lng: 106.1167 },   // Tây Ninh
    "82": { lat: 10.35, lng: 106.35 },      // Tiền Giang
    "74": { lat: 10.4114, lng: 107.1358 },   // Bà Rịa - Vũng Tàu
    "83": { lat: 10.25, lng: 106.3667 },     // Bến Tre
    "84": { lat: 10.25, lng: 105.9667 },     // Vĩnh Long
    "86": { lat: 10.25, lng: 105.6333 },     // Đồng Tháp
    "89": { lat: 10.3833, lng: 105.4167 },   // An Giang
    "91": { lat: 10.03, lng: 105.08 },       // Kiên Giang
    "93": { lat: 9.75, lng: 105.4667 },      // Hậu Giang
    "94": { lat: 9.5833, lng: 105.9667 },     // Sóc Trăng
    "95": { lat: 9.2833, lng: 105.7167 },     // Bạc Liêu
    "96": { lat: 9.1833, lng: 105.15 },       // Cà Mau
    "68": { lat: 11.9404, lng: 108.4583 },   // Lâm Đồng
    "67": { lat: 12.6667, lng: 108.05 },      // Đắk Lắk
    "66": { lat: 12.0, lng: 107.6833 },       // Đắk Nông
    "64": { lat: 13.9833, lng: 108.0 },       // Gia Lai
    "62": { lat: 14.35, lng: 108.0 },        // Kon Tum
    "60": { lat: 10.9333, lng: 108.1 },       // Bình Thuận
    "58": { lat: 11.5667, lng: 108.9833 },    // Ninh Thuận
    "56": { lat: 12.25, lng: 109.1833 },     // Khánh Hòa
    "54": { lat: 13.0833, lng: 109.3 },       // Phú Yên
    "52": { lat: 13.7667, lng: 109.2333 },    // Bình Định
    "51": { lat: 15.1167, lng: 108.8 },       // Quảng Ngãi
    "49": { lat: 15.5667, lng: 108.4833 },    // Quảng Nam
    "46": { lat: 16.4667, lng: 107.6 },       // Thừa Thiên Huế
    "45": { lat: 16.7333, lng: 107.2 },       // Quảng Trị
    "44": { lat: 17.4833, lng: 106.6 },       // Quảng Bình
    "42": { lat: 18.3333, lng: 105.9 },       // Hà Tĩnh
    "40": { lat: 18.6667, lng: 105.6667 },    // Nghệ An
    "38": { lat: 19.8, lng: 105.7833 },       // Thanh Hóa
};

/**
 * Calculates the distance between two points using the Haversine formula.
 */
function getHaversineDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
    const dLng = (point2.lng - point1.lng) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * (Math.PI / 180)) *
        Math.cos(point2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculates shipping fee based on province code and total weight.
 * Implements progressive surcharge for distances over 500km.
 */
export function calculateShippingFeeByCode(provinceCode: string, totalWeightKg: number): number {
    if (provinceCode === "79") return 0; // HCMC is free

    const destCoords = PROVINCE_COORDS[provinceCode];
    if (!destCoords) return 50000; // Default flat fee for unknown provinces

    const distanceKm = getHaversineDistance(HCMC_COORDS, destCoords);

    // --- Progressive Calculation for Long Distances (> 500km) ---
    if (distanceKm > 500) {
        const baseRates500 = RATES.base["500"];
        const extraRates500 = RATES.extra["500"];

        const extraDistanceKm = distanceKm - 500;
        const distanceSteps = Math.ceil(extraDistanceKm / 100);

        // Surcharge per 100km: 10,000 for base, 500 for extra weight unit rate
        const distanceSurchargeBase = distanceSteps * 10000;
        const weightRateSurcharge = distanceSteps * 500;

        let baseFee = 0;
        if (totalWeightKg <= 0.5) baseFee = baseRates500.upTo05;
        else if (totalWeightKg <= 1) baseFee = baseRates500.upTo1;
        else if (totalWeightKg <= 2) baseFee = baseRates500.upTo2;
        else baseFee = baseRates500.upTo3;

        baseFee += distanceSurchargeBase;

        if (totalWeightKg <= 3) return Math.floor(baseFee / 10000) * 10000;

        // Weight > 3kg
        const extraWeight = totalWeightKg - 3;
        const extraUnits = Math.ceil(extraWeight / 0.5);

        let rate = extraRates500.above3;
        if (totalWeightKg > 40) rate = extraRates500.above40;
        else if (totalWeightKg > 20) rate = extraRates500.above20;
        else if (totalWeightKg > 15) rate = extraRates500.above15;
        else if (totalWeightKg > 10) rate = extraRates500.above10;
        else if (totalWeightKg > 5) rate = extraRates500.above5;

        // Apply progressive weight rate surcharge
        rate += weightRateSurcharge;

        const finalFee = baseFee + extraUnits * rate;
        return Math.floor(finalFee / 10000) * 10000;
    }

    // --- Standard Tiered Calculation (<= 500km) ---
    let tier: DistanceTier = "500";
    if (distanceKm < 100) tier = "under100";
    else if (distanceKm < 200) tier = "100-200";
    else if (distanceKm < 275) tier = "250";
    else if (distanceKm < 375) tier = "300-350";
    else if (distanceKm < 450) tier = "400";

    const baseRates = RATES.base[tier];
    const extraRates = RATES.extra[tier];

    let baseFee = 0;
    if (totalWeightKg <= 0.5) baseFee = baseRates.upTo05;
    else if (totalWeightKg <= 1) baseFee = baseRates.upTo1;
    else if (totalWeightKg <= 2) baseFee = baseRates.upTo2;
    else baseFee = baseRates.upTo3;

    if (totalWeightKg <= 3) return Math.floor(baseFee / 10000) * 10000;

    // Weight > 3kg
    const extraWeight = totalWeightKg - 3;
    const extraUnits = Math.ceil(extraWeight / 0.5);

    let rate = extraRates.above3;
    if (totalWeightKg > 40) rate = extraRates.above40;
    else if (totalWeightKg > 20) rate = extraRates.above20;
    else if (totalWeightKg > 15) rate = extraRates.above15;
    else if (totalWeightKg > 10) rate = extraRates.above10;
    else if (totalWeightKg > 5) rate = extraRates.above5;

    const finalFee = baseFee + extraUnits * rate;
    return Math.floor(finalFee / 10000) * 10000;
}
