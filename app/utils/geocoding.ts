/**
 * Reverse Geocoding Utility for SolarHub
 * 
 * Provides robust 3-tier translation of coordinates (lat, lng) to precise Arabic addresses:
 * Tier 1: Photon OpenStreetMap (High precision: street, landmark, district, city, governorate)
 * Tier 2: BigDataCloud Geocoding (Secondary fallback: administrative levels, district, city)
 * Tier 3: Offline local database (Zero-latency fallback: 70+ Yemeni and Saudi districts & cities)
 */

export interface PopularLocationItem {
  name: string
  governorate: string
  lat: number
  lng: number
  aliases: string[]
}

export interface GeocodedLocation {
  formattedAddress: string
  shortAddress: string
  country: string
  governorate: string
  district?: string
  city?: string
  neighborhood?: string
  street?: string
  landmark?: string
  lat: number
  lng: number
  source: 'photon' | 'bigdatacloud' | 'local_db'
}

// In-memory cache keyed by rounded coordinates (~11m resolution)
const geocodeCache = new Map<string, GeocodedLocation>()

export const popularLocations: PopularLocationItem[] = [
  // Yemen - Sana'a & Districts
  { name: 'صنعاء - مركز المحافظة', governorate: 'صنعاء', lat: 15.3694, lng: 44.1910, aliases: ['صنعاء', 'امانه العاصمة', 'أمانة العاصمة'] },
  { name: 'صنعاء - حدة', governorate: 'صنعاء', lat: 15.3120, lng: 44.1960, aliases: ['حدة', 'شارع حدة', 'حي حدة'] },
  { name: 'صنعاء - السبعين', governorate: 'صنعاء', lat: 15.3280, lng: 44.2050, aliases: ['السبعين', 'ميدان السبعين', 'حديقة السبعين'] },
  { name: 'صنعاء - التحرير', governorate: 'صنعاء', lat: 15.3550, lng: 44.2070, aliases: ['التحرير', 'ميدان التحرير'] },
  { name: 'صنعاء - الصافية', governorate: 'صنعاء', lat: 15.3420, lng: 44.2180, aliases: ['الصافية', 'حي الصافية'] },
  { name: 'صنعاء - شملان', governorate: 'صنعاء', lat: 15.4050, lng: 44.1480, aliases: ['شملان', 'شارع شملan'] },
  { name: 'صنعاء - الروضة', governorate: 'صنعاء', lat: 15.4350, lng: 44.2250, aliases: ['الروضة', 'حي الروضة'] },
  { name: 'صنعاء - الحصبة', governorate: 'صنعاء', lat: 15.3780, lng: 44.2000, aliases: ['الحصبة', 'جولة الحصبة'] },
  { name: 'صنعاء - شعوب', governorate: 'صنعاء', lat: 15.3750, lng: 44.2250, aliases: ['شعوب', 'باب شعوب'] },
  { name: 'صنعاء - دار سلم', governorate: 'صنعاء', lat: 15.2750, lng: 44.2250, aliases: ['دار سلم', 'جولة دار سلم'] },
  { name: 'صنعاء - مذبح', governorate: 'صنعاء', lat: 15.3720, lng: 44.1620, aliases: ['مذبح', 'شارع الثلاثين'] },
  { name: 'صنعاء - عصر', governorate: 'صنعاء', lat: 15.3390, lng: 44.1700, aliases: ['عصر', 'جبل عصر'] },
  { name: 'صنعاء - معين', governorate: 'صنعاء', lat: 15.3600, lng: 44.1750, aliases: ['معين', 'حي معين', 'شارع هايل'] },
  { name: 'صنعاء - سعوان', governorate: 'صنعاء', lat: 15.3700, lng: 44.2500, aliases: ['سعوان', 'مدينة سعوان'] },

  // Yemen - Aden & Districts
  { name: 'عدن - مركز المدينة', governorate: 'عدن', lat: 12.7855, lng: 45.0187, aliases: ['عدن'] },
  { name: 'عدن - المعلا', governorate: 'عدن', lat: 12.7850, lng: 45.0080, aliases: ['المعلا', 'شارع مدرم'] },
  { name: 'عدن - كريتر', governorate: 'عدن', lat: 12.7750, lng: 45.0350, aliases: ['كريتر', 'صيرة'] },
  { name: 'عدن - التواهي', governorate: 'عدن', lat: 12.7830, lng: 44.9850, aliases: ['التواهي', 'القلوعة'] },
  { name: 'عدن - خور مكسر', governorate: 'عدن', lat: 12.8050, lng: 45.0380, aliases: ['خور مكسر', 'ساحل أبين'] },
  { name: 'عدن - المنصورة', governorate: 'عدن', lat: 12.8550, lng: 44.9920, aliases: ['المنصورة', 'كابوتا'] },
  { name: 'عدن - الشيخ عثمان', governorate: 'عدن', lat: 12.8680, lng: 45.0020, aliases: ['الشيخ عثمان', 'الممدارة'] },
  { name: 'عدن - البريقة', governorate: 'عدن', lat: 12.7350, lng: 44.8750, aliases: ['البريقة', 'صلاح الدين', 'إنماء'] },
  { name: 'عدن - دار سعد', governorate: 'عدن', lat: 12.8880, lng: 45.0150, aliases: ['دار سعد', 'بئر فضل'] },

  // Yemen - Taiz
  { name: 'تعز - مركز المحافظة', governorate: 'تعز', lat: 13.5776, lng: 44.0185, aliases: ['تعز'] },
  { name: 'تعز - شارع جمال', governorate: 'تعز', lat: 13.5790, lng: 44.0150, aliases: ['شارع جمال', 'وسط تعز'] },
  { name: 'تعز - الحوبان', governorate: 'تعز', lat: 13.6200, lng: 44.0800, aliases: ['الحوبان', 'مفرق ماوية'] },
  { name: 'تعز - المظفر', governorate: 'تعز', lat: 13.5750, lng: 44.0100, aliases: ['المظفر', 'حي المظفر'] },
  { name: 'تعز - القاهرة', governorate: 'تعز', lat: 13.5850, lng: 44.0250, aliases: ['القاهرة', 'قلعة القاهرة'] },
  { name: 'تعز - بير باشا', governorate: 'تعز', lat: 13.5720, lng: 43.9850, aliases: ['بير باشا', 'جامعة تعز'] },
  { name: 'تعز - التربة', governorate: 'تعز', lat: 13.2180, lng: 44.1350, aliases: ['التربة', 'الشمايتين'] },

  // Yemen - Hadhramaut
  { name: 'حضرموت - المكلا', governorate: 'حضرموت', lat: 14.5425, lng: 49.1242, aliases: ['المكلا', 'حضرموت'] },
  { name: 'حضرموت - فوة', governorate: 'حضرموت', lat: 14.5200, lng: 49.0600, aliases: ['فوة', 'المساكن', 'ابن سيناء'] },
  { name: 'حضرموت - الديس', governorate: 'حضرموت', lat: 14.5550, lng: 49.1450, aliases: ['الديس', 'حي الديس'] },
  { name: 'حضرموت - الشرج', governorate: 'حضرموت', lat: 14.5380, lng: 49.1180, aliases: ['الشرج', 'سوق الشرج'] },
  { name: 'حضرموت - سيئون', governorate: 'حضرموت', lat: 15.9432, lng: 48.7871, aliases: ['سيئون', 'وادي حضرموت'] },
  { name: 'حضرموت - تريم', governorate: 'حضرموت', lat: 16.0550, lng: 48.9950, aliases: ['تريم', 'الغناء'] },
  { name: 'حضرموت - الشحر', governorate: 'حضرموت', lat: 14.7600, lng: 49.6050, aliases: ['الشحر', 'سعاد'] },

  // Yemen - Al Hudaydah
  { name: 'الحديدة - مركز المحافظة', governorate: 'الحديدة', lat: 14.7978, lng: 42.9545, aliases: ['الحديدة'] },
  { name: 'الحديدة - الميناء', governorate: 'الحديدة', lat: 14.8050, lng: 42.9450, aliases: ['الميناء', 'ميناء الحديدة'] },
  { name: 'الحديدة - الحوك', governorate: 'الحديدة', lat: 14.7750, lng: 42.9600, aliases: ['الحوك', 'حي الحوك'] },
  { name: 'الحديدة - الحالي', governorate: 'الحديدة', lat: 14.8150, lng: 42.9750, aliases: ['الحالي', 'حي الحالي'] },
  { name: 'الحديدة - باجل', governorate: 'الحديدة', lat: 15.0580, lng: 43.2850, aliases: ['باجل'] },
  { name: 'الحديدة - زبيد', governorate: 'الحديدة', lat: 14.1950, lng: 43.3150, aliases: ['زبيد'] },

  // Yemen - Other Governorates
  { name: 'إب - مركز المحافظة', governorate: 'إب', lat: 13.9667, lng: 44.1833, aliases: ['إب', 'اب'] },
  { name: 'إب - جبلة', governorate: 'إب', lat: 13.9220, lng: 44.1480, aliases: ['جبلة'] },
  { name: 'إب - يريم', governorate: 'إب', lat: 14.2980, lng: 44.3800, aliases: ['يريم', 'كتاب'] },
  { name: 'ذمار - مركز المحافظة', governorate: 'ذمار', lat: 14.5427, lng: 44.4051, aliases: ['ذمار'] },
  { name: 'ذمار - معبر', governorate: 'ذمار', lat: 14.7950, lng: 44.2950, aliases: ['معبر', 'جهران'] },
  { name: 'مأرب - مركز المحافظة', governorate: 'مأرب', lat: 15.4608, lng: 45.3258, aliases: ['مأرب', 'مارب'] },
  { name: 'صعدة - مركز المحافظة', governorate: 'صعدة', lat: 16.9402, lng: 43.7640, aliases: ['صعدة', 'صعده'] },
  { name: 'حجة - مركز المحافظة', governorate: 'حجة', lat: 15.6943, lng: 43.6025, aliases: ['حجة', 'حجه', 'عبس'] },
  { name: 'البيضاء - مركز المحافظة', governorate: 'البيضاء', lat: 13.9852, lng: 45.5727, aliases: ['البيضاء', 'رداع'] },
  { name: 'لحج - الحوطة', governorate: 'لحج', lat: 13.0583, lng: 44.8828, aliases: ['لحج', 'الحوطة', 'صبر'] },
  { name: 'أبين - زنجبار', governorate: 'أبين', lat: 13.1287, lng: 45.3800, aliases: ['أبين', 'ابين', 'زنجبار', 'جعار'] },
  { name: 'المهرة - الغيضة', governorate: 'المهرة', lat: 16.2079, lng: 52.1760, aliases: ['المهرة', 'المهره', 'الغيضة'] },
  { name: 'شبوة - عتق', governorate: 'شبوة', lat: 14.5377, lng: 46.8319, aliases: ['شبوة', 'شبوه', 'عتق'] },
  { name: 'الضالع - مركز المحافظة', governorate: 'الضالع', lat: 13.6957, lng: 44.7314, aliases: ['الضالع', 'دمت', 'قعطبة'] },
  { name: 'عمران - مركز المحافظة', governorate: 'عمران', lat: 15.6594, lng: 43.9442, aliases: ['عمران', 'خمر', 'ريدة'] },
  { name: 'سقطرى - حديبو', governorate: 'سقطرى', lat: 12.6500, lng: 54.0167, aliases: ['سقطرى', 'حديبو', 'قلنسية'] },

  // Saudi Arabia - Riyadh & Districts
  { name: 'الرياض - مركز المدينة', governorate: 'الرياض', lat: 24.7136, lng: 46.6753, aliases: ['الرياض'] },
  { name: 'الرياض - العليا', governorate: 'الرياض', lat: 24.7050, lng: 46.6800, aliases: ['العليا', 'طريق الملك فهد'] },
  { name: 'الرياض - الملز', governorate: 'الرياض', lat: 24.6650, lng: 46.7250, aliases: ['الملز', 'شارع الستين'] },
  { name: 'الرياض - النسيم', governorate: 'الرياض', lat: 24.7300, lng: 46.8200, aliases: ['النسيم'] },
  { name: 'الرياض - الملقا', governorate: 'الرياض', lat: 24.8050, lng: 46.6150, aliases: ['الملقا', 'شمال الرياض'] },
  { name: 'الرياض - النرجس', governorate: 'الرياض', lat: 24.8450, lng: 46.6600, aliases: ['النرجس'] },
  { name: 'الرياض - الياسمين', governorate: 'الرياض', lat: 24.8250, lng: 46.6450, aliases: ['الياسمين'] },

  // Saudi Arabia - Makkah & Jeddah & Taif
  { name: 'مكة المكرمة - الحرم', governorate: 'مكة المكرمة', lat: 21.3891, lng: 39.8579, aliases: ['مكة', 'مكه', 'مكة المكرمة'] },
  { name: 'مكة المكرمة - العزيزية', governorate: 'مكة المكرمة', lat: 21.4050, lng: 39.8700, aliases: ['العزيزية بمكة'] },
  { name: 'جدة - مركز المدينة', governorate: 'مكة المكرمة', lat: 21.5433, lng: 39.1728, aliases: ['جدة', 'جده'] },
  { name: 'جدة - البلد', governorate: 'مكة المكرمة', lat: 21.4850, lng: 39.1850, aliases: ['البلد بجدة', 'المنطقة التاريخية'] },
  { name: 'جدة - الحمراء', governorate: 'مكة المكرمة', lat: 21.5150, lng: 39.1550, aliases: ['الحمراء', 'كورنيش جدة'] },
  { name: 'جدة - الروضة', governorate: 'مكة المكرمة', lat: 21.5600, lng: 39.1500, aliases: ['الروضة بجدة'] },
  { name: 'جدة - الصفا', governorate: 'مكة المكرمة', lat: 21.5850, lng: 39.2000, aliases: ['الصفا بجدة'] },
  { name: 'الطائف - مركز المدينة', governorate: 'مكة المكرمة', lat: 21.2854, lng: 40.4244, aliases: ['الطائف', 'الهدا', 'الشفا الطائف'] },

  // Saudi Arabia - Madinah & Eastern & Others
  { name: 'المدينة المنورة - الحرم النبوي', governorate: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, aliases: ['المدينة', 'المدينه', 'المدينة المنورة'] },
  { name: 'الدمام - مركز المدينة', governorate: 'المنطقة الشرقية', lat: 26.4207, lng: 50.0888, aliases: ['الدمام', 'الشرقية'] },
  { name: 'الخبر - كورنيش الخبر', governorate: 'المنطقة الشرقية', lat: 26.2818, lng: 50.2084, aliases: ['الخبر', 'العقربية'] },
  { name: 'الهفوف - الأحساء', governorate: 'المنطقة الشرقية', lat: 25.3646, lng: 49.5883, aliases: ['الأحساء', 'الاحساء', 'الهفوف', 'المبرز'] },
  { name: 'الجبيل - الجبيل الصناعية', governorate: 'المنطقة الشرقية', lat: 27.0174, lng: 49.6582, aliases: ['الجبيل'] },
  { name: 'القصيم - بريدة', governorate: 'القصيم', lat: 26.3260, lng: 43.9750, aliases: ['القصيم', 'بريدة', 'بريده'] },
  { name: 'القصيم - عنيزة', governorate: 'القصيم', lat: 26.0843, lng: 43.9936, aliases: ['عنيزة', 'عنيزه'] },
  { name: 'عسير - أبها', governorate: 'عسير', lat: 18.2164, lng: 42.5053, aliases: ['عسير', 'أبها', 'ابها'] },
  { name: 'عسير - خميس مشيط', governorate: 'عسير', lat: 18.3000, lng: 42.7333, aliases: ['خميس مشيط'] },
  { name: 'تبوك - مركز المدينة', governorate: 'تبوك', lat: 28.3835, lng: 36.5662, aliases: ['تبوك'] },
  { name: 'حائل - مركز المدينة', governorate: 'حائل', lat: 27.5114, lng: 41.7208, aliases: ['حائل', 'حايل'] },
  { name: 'جازان - مركز المدينة', governorate: 'جازان', lat: 16.8892, lng: 42.5706, aliases: ['جازان', 'جيزان'] },
  { name: 'نجران - مركز المدينة', governorate: 'نجران', lat: 17.4924, lng: 44.1277, aliases: ['نجران'] },
  { name: 'ينبع - ينبع الصناعية', governorate: 'المدينة المنورة', lat: 24.0924, lng: 38.0618, aliases: ['ينبع', 'ينبع البحر'] },
]

/**
 * Clean & normalize governorate name in Arabic
 */
export function normalizeGovernorateName(name?: string): string {
  if (!name) return 'صنعاء'
  let cleaned = name.trim()
  cleaned = cleaned.replace(/^محافظة\s+/i, '')
  cleaned = cleaned.replace(/^منطقة\s+/i, '')
  if (cleaned.includes('أمانة العاصمة') || cleaned.includes('امانة العاصمة')) {
    return 'أمانة العاصمة'
  }
  return cleaned
}

/**
 * Filter out duplicate/redundant terms and join with a clean delimiter
 */
function cleanAndJoin(segments: (string | undefined | null)[]): string {
  const seen = new Set<string>()
  const result: string[] = []

  for (const seg of segments) {
    if (!seg) continue
    const trimmed = seg.trim()
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') continue

    // Normalize for comparison
    const lower = trimmed.toLowerCase()
    let isDuplicate = false
    for (const s of seen) {
      if (s === lower || (s.length > 3 && lower.includes(s)) || (lower.length > 3 && s.includes(lower))) {
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      seen.add(lower)
      result.push(trimmed)
    }
  }

  return result.join(' - ')
}

/**
 * Find closest location from local offline database (Tier 3)
 */
export function findNearestLocation(lat: number, lng: number): GeocodedLocation {
  let nearest = popularLocations[0]
  let minDistance = Infinity

  for (const loc of popularLocations) {
    const dist = Math.hypot(loc.lat - lat, loc.lng - lng)
    if (dist < minDistance) {
      minDistance = dist
      nearest = loc
    }
  }

  const governorate = normalizeGovernorateName(nearest.governorate)
  const shortAddress = nearest.name
  const formattedAddress = nearest.governorate.includes('الرياض') || nearest.governorate.includes('مكة') || nearest.governorate.includes('المدينة') || nearest.governorate.includes('الشرقية')
    ? `السعودية - ${nearest.name}`
    : `اليمن - ${nearest.name}`

  return {
    formattedAddress,
    shortAddress,
    country: formattedAddress.includes('السعودية') ? 'السعودية' : 'اليمن',
    governorate,
    city: nearest.name.split(' - ')[0],
    district: nearest.name.split(' - ')[1],
    lat,
    lng,
    source: 'local_db',
  }
}

/**
 * Tier 1: Photon OpenStreetMap Reverse Geocode
 */
async function fetchPhoton(lat: number, lng: number, signal?: AbortSignal): Promise<GeocodedLocation | null> {
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null
  const data = await res.json()
  const p = data?.features?.[0]?.properties
  if (!p) return null

  const country = p.country || 'اليمن'
  const governorate = normalizeGovernorateName(p.state || p.county || p.city)
  const district = p.county || p.district || p.locality
  const city = p.city
  const neighborhood = p.locality || p.district
  const street = p.street
  const landmark = p.name !== street && p.name !== city ? p.name : undefined

  // Construct hierarchy: Country -> Governorate -> District -> Neighborhood -> Street -> Landmark
  const formattedAddress = cleanAndJoin([
    country,
    governorate,
    district,
    neighborhood !== district ? neighborhood : undefined,
    street,
    landmark,
  ])

  const shortAddress = cleanAndJoin([
    governorate,
    district !== governorate ? district : undefined,
    street || neighborhood,
  ])

  return {
    formattedAddress: formattedAddress || `${governorate} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    shortAddress: shortAddress || governorate,
    country,
    governorate,
    district,
    city,
    neighborhood,
    street,
    landmark,
    lat,
    lng,
    source: 'photon',
  }
}

/**
 * Tier 2: BigDataCloud Reverse Geocoding (Arabic locality client)
 */
async function fetchBigDataCloud(lat: number, lng: number, signal?: AbortSignal): Promise<GeocodedLocation | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const data = await res.json()

  const country = data.countryName || 'اليمن'
  const governorate = normalizeGovernorateName(data.principalSubdivision || data.city)
  const district = data.locality
  const city = data.city

  const formattedAddress = cleanAndJoin([
    country,
    governorate,
    district,
    city !== governorate ? city : undefined,
  ])

  const shortAddress = cleanAndJoin([
    governorate,
    district,
  ])

  return {
    formattedAddress: formattedAddress || `${governorate} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    shortAddress: shortAddress || governorate,
    country,
    governorate,
    district,
    city,
    lat,
    lng,
    source: 'bigdatacloud',
  }
}

export interface ReverseGeocodeOptions {
  timeoutMs?: number
  signal?: AbortSignal
  skipCache?: boolean
}

/**
 * Main Reverse Geocode function with caching & 3-tier fallback.
 * Can be called from any script, component, or utility in the application.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  options: ReverseGeocodeOptions = {}
): Promise<GeocodedLocation> {
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return findNearestLocation(15.3694, 44.1910)
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (!options.skipCache && geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  const timeoutMs = options.timeoutMs ?? 3000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // Combined abort signal
  const activeSignal = options.signal || controller.signal

  try {
    // 1. Try Tier 1: Photon (OpenStreetMap)
    try {
      const result = await fetchPhoton(lat, lng, activeSignal)
      if (result && result.formattedAddress) {
        clearTimeout(timeoutId)
        geocodeCache.set(cacheKey, result)
        return result
      }
    } catch {
      // Photon failed or timed out, proceed to Tier 2
    }

    // 2. Try Tier 2: BigDataCloud
    try {
      const result = await fetchBigDataCloud(lat, lng, activeSignal)
      if (result && result.formattedAddress) {
        clearTimeout(timeoutId)
        geocodeCache.set(cacheKey, result)
        return result
      }
    } catch {
      // BigDataCloud failed or timed out, proceed to Tier 3
    }
  } finally {
    clearTimeout(timeoutId)
  }

  // 3. Fallback Tier 3: Local Offline Database (0ms response guarantee)
  const fallback = findNearestLocation(lat, lng)
  geocodeCache.set(cacheKey, fallback)
  return fallback
}
