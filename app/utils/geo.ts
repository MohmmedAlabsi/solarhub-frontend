export const governorateCoordinatesMap: Record<string, { lat: number; lng: number }> = {
  'صنعاء': { lat: 15.3694, lng: 44.1910 },
  'أمانة العاصمة': { lat: 15.3694, lng: 44.1910 },
  'عدن': { lat: 12.7855, lng: 45.0187 },
  'تعز': { lat: 13.5776, lng: 44.0175 },
  'الحديدة': { lat: 14.7978, lng: 42.9545 },
  'إب': { lat: 13.9667, lng: 44.1833 },
  'مأرب': { lat: 15.4636, lng: 45.3258 },
  'ذمار': { lat: 14.5427, lng: 44.4051 },
  'حضرموت': { lat: 14.5385, lng: 49.1274 },
  'المكلا': { lat: 14.5385, lng: 49.1274 },
  'سيئون': { lat: 15.9431, lng: 48.7872 },
  'عمران': { lat: 15.6592, lng: 43.9406 },
  'حجة': { lat: 15.6942, lng: 43.6033 },
  'الضالع': { lat: 13.6961, lng: 44.7314 },
  'صعدة': { lat: 16.9402, lng: 43.7639 },
  'شبوة': { lat: 14.5377, lng: 46.8319 },
  'عتق': { lat: 14.5377, lng: 46.8319 },
  'أبين': { lat: 13.1287, lng: 45.3804 },
  'زنجبار': { lat: 13.1287, lng: 45.3804 },
  'لحج': { lat: 13.0583, lng: 44.8828 },
  'المهرة': { lat: 16.2079, lng: 52.1764 },
  'الغيضة': { lat: 16.2079, lng: 52.1764 },
  'البيضاء': { lat: 13.9852, lng: 45.5727 },
  'الجوف': { lat: 16.7906, lng: 45.2289 },
  'سقطرى': { lat: 12.4634, lng: 53.8237 },
  'المحويت': { lat: 15.4701, lng: 43.5448 },
  'ريمة': { lat: 14.6300, lng: 43.7100 },
}

/**
 * دالة مساعدة لاستخراج الإحداثيات الجغرافية بدقة، أو الاستعانة بإحداثيات المحافظة في حال عدم تحديد موقع تفصيلي
 */
export function parseCoordinates(raw: any, governorateName?: string): { lat: number; lng: number } {
  if (raw && typeof raw === 'object') {
    const lat = Number(raw.lat ?? raw.latitude)
    const lng = Number(raw.lng ?? raw.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng }
    }
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()

    // 1. PostGIS EWKB Hex format (e.g. 0101000020E6100000...)
    if (/^0101000020[0-9a-fA-F]{40}$/i.test(trimmed)) {
      try {
        const match = trimmed.match(/^0101000020[0-9a-fA-F]{8}([0-9a-fA-F]{16})([0-9a-fA-F]{16})$/i)
        if (match && match[1] && match[2]) {
          const hexToDouble = (hex: string) => {
            const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
            const view = new DataView(bytes.buffer)
            return view.getFloat64(0, true) // little endian
          }
          const lng = hexToDouble(match[1])
          const lat = hexToDouble(match[2])
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            return { lat, lng }
          }
        }
      } catch {
        // continue
      }
    }

    // 2. format "POINT(lng lat)" or "POINT (lng lat)"
    const pointMatch = trimmed.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
    if (pointMatch && pointMatch[1] && pointMatch[2]) {
      const p1 = parseFloat(pointMatch[1])
      const p2 = parseFloat(pointMatch[2])
      if (!isNaN(p1) && !isNaN(p2)) {
        const isP1Lng = (p1 > 35 && p1 < 65) || (p2 > 10 && p2 < 35)
        const lng = isP1Lng ? p1 : p2
        const lat = isP1Lng ? p2 : p1
        return { lat, lng }
      }
    }

    // 3. format "lat,lng"
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',')
      const lat = parseFloat(parts[0]?.trim() || '')
      const lng = parseFloat(parts[1]?.trim() || '')
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng }
      }
    }

    // 4. Embedded coordinates in text, e.g. "(15.3897, 44.1888)"
    const embeddedMatch = trimmed.match(/\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/)
    if (embeddedMatch && embeddedMatch[1] && embeddedMatch[2]) {
      const p1 = parseFloat(embeddedMatch[1])
      const p2 = parseFloat(embeddedMatch[2])
      if (!isNaN(p1) && !isNaN(p2)) {
        const isP1Lat = p1 >= -90 && p1 <= 90 && (p2 > 30 && p2 < 60)
        const lat = isP1Lat ? p1 : p2
        const lng = isP1Lat ? p2 : p1
        return { lat, lng }
      }
    }

    // 5. format JSON
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') {
        const lat = Number(parsed.lat ?? parsed.latitude)
        const lng = Number(parsed.lng ?? parsed.longitude)
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          return { lat, lng }
        }
      }
    } catch {
      // not JSON
    }
  }

  // Fallback to governorate center
  if (governorateName) {
    for (const [key, coords] of Object.entries(governorateCoordinatesMap)) {
      if (governorateName.includes(key) || key.includes(governorateName)) {
        return coords
      }
    }
  }

  // Default Sana'a, Yemen
  return { lat: 15.3694, lng: 44.1910 }
}
