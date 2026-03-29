import vnAddress from '../../data/vnAddress.json';

export function parseAddress(address?: string) {
  if (!address) return 'No address';

  const parts = address.split(',').map(p => p.trim());
  if (parts.length < 4) return address;

  const [street, wardCode, districtCode, provinceCode] = parts;

  // 1. tìm province
  const province = vnAddress.find(p => p.code === provinceCode);
  if (!province) return address;

  // 2. tìm district
  const district = province.districts.find(d => d.code === districtCode);
  if (!district) return `${street}, ${province.name}`;

  // 3. tìm ward
  const ward = district.wards.find(w => w.code === wardCode);

  return [
    street,
    ward?.name || wardCode,
    district.name,
    province.name
  ].join(', ');
}