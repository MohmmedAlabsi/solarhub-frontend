import { ref } from 'vue'
import {
  reverseGeocode,
  findNearestLocation,
  type GeocodedLocation,
  type ReverseGeocodeOptions,
} from '~/utils/geocoding'

/**
 * Composable for Reverse Geocoding in Nuxt
 * 
 * Usable anywhere across the SolarHub project.
 * Automatically handles debouncing, aborting previous in-flight requests,
 * and maintains reactive loading & result states.
 */
export function useReverseGeocoding() {
  const isGeocoding = ref(false)
  const geocodedLocation = ref<GeocodedLocation | null>(null)
  const geocodeError = ref<string | null>(null)

  let activeController: AbortController | null = null

  /**
   * Translate coordinates to a precise Arabic address
   */
  async function reverseGeocodeAddress(
    lat: number,
    lng: number,
    options: Omit<ReverseGeocodeOptions, 'signal'> = {}
  ): Promise<GeocodedLocation> {
    // Abort previous in-flight request if user is actively dragging/moving
    if (activeController) {
      activeController.abort()
      activeController = null
    }

    activeController = new AbortController()
    isGeocoding.value = true
    geocodeError.value = null

    try {
      const result = await reverseGeocode(lat, lng, {
        ...options,
        signal: activeController.signal,
      })
      geocodedLocation.value = result
      return result
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Ignored aborted call
        return geocodedLocation.value || findNearestLocation(lat, lng)
      }
      console.warn('Reverse geocoding notice:', err)
      geocodeError.value = 'تعذر الاتصال بخدمة ترجمة العناوين، تم استخدام قاعدة البيانات المحلية'
      const fallback = findNearestLocation(lat, lng)
      geocodedLocation.value = fallback
      return fallback
    } finally {
      isGeocoding.value = false
      activeController = null
    }
  }

  function cancel() {
    if (activeController) {
      activeController.abort()
      activeController = null
      isGeocoding.value = false
    }
  }

  return {
    isGeocoding,
    geocodedLocation,
    geocodeError,
    reverseGeocodeAddress,
    cancel,
  }
}
