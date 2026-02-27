import locationData from "./DonViHanhChinhdata.json";

// Types for location data
export interface Ward {
  ward_code: string;
  name: string;
  province_code: string;
}

export interface Province {
  province_code: string;
  name: string;
  short_name: string;
  code: string;
  place_type: string;
  wards: Ward[];
}

// Parse JSON data
const provinces = locationData as Province[];

// Export all provinces for dropdown
export const VN_PROVINCES = provinces.map((province) => ({
  value: province.province_code,
  label: province.name.replace(/^(Thành phố|Tỉnh)\s+/, ""), // Remove prefix for cleaner display
}));

// Get wards/districts by province code
export function getWardsByProvince(
  provinceCode: string,
): { value: string; label: string }[] {
  const province = provinces.find((p) => p.province_code === provinceCode);
  if (!province) return [];

  return province.wards.map((ward) => ({
    value: ward.ward_code,
    label: ward.name,
  }));
}

// Get province name by code
export function getProvinceName(provinceCode: string): string {
  const province = provinces.find((p) => p.province_code === provinceCode);
  return province ? province.name.replace(/^(Thành phố|Tỉnh)\s+/, "") : "";
}

// Major cities (most populated provinces) - in order of popularity
const MAJOR_CITY_CODES = ["79", "01", "48", "31", "92", "75", "68", "56"];

export const POPULAR_PROVINCES = provinces
  .filter((p) => MAJOR_CITY_CODES.includes(p.province_code))
  .map((p) => ({
    value: p.province_code,
    label: p.name.replace(/^(Thành phố|Tỉnh)\s+/, ""),
  }));
