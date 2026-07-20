/**
 * Assam district GeoJSON name ↔ portal district name matching.
 * GeoJSON: frontend/public/geo/assam-districts.geojson (open India maps data; prototype).
 */

const GEO_NAME_ALIASES = {
	kamrup: 'Kamrup Rural',
	'south salmara mankachar': 'South Salmara-Mankachar',
	'south salmara-mankachar': 'South Salmara-Mankachar',
	'kamrup metropolitan': 'Kamrup Metropolitan',
	'kamrup metro': 'Kamrup Metropolitan',
	'north cachar hills': 'Dima Hasao',
	'n c hills': 'Dima Hasao',
	'sibsagar': 'Sivasagar',
	'marigaon': 'Morigaon',
}

export function normalizeDistrictKey(name) {
	return String(name || '')
		.toLowerCase()
		.replace(/[–—]/g, '-')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ')
}

export function canonicalDistrictName(geoName) {
	const key = normalizeDistrictKey(geoName)
	return GEO_NAME_ALIASES[key] || String(geoName || '').trim()
}

export function buildDistrictLookup(districts = []) {
	const byKey = new Map()
	districts.forEach((d) => {
		if (!d?.name) return
		byKey.set(normalizeDistrictKey(d.name), d)
		byKey.set(normalizeDistrictKey(canonicalDistrictName(d.name)), d)
	})
	return byKey
}

export function findDistrictForGeoFeature(feature, lookup) {
	const raw = feature?.properties?.district || feature?.properties?.DISTRICT || ''
	const canonical = canonicalDistrictName(raw)
	return (
		lookup.get(normalizeDistrictKey(canonical)) ||
		lookup.get(normalizeDistrictKey(raw)) ||
		null
	)
}

/** True if a GeoJSON feature matches a portal district name (with aliases). */
export function geoFeatureMatchesDistrictName(feature, districtName) {
	if (!districtName) return false
	const raw = feature?.properties?.district || feature?.properties?.DISTRICT || ''
	const focus = normalizeDistrictKey(districtName)
	const geo = normalizeDistrictKey(raw)
	const canonical = normalizeDistrictKey(canonicalDistrictName(raw))
	const focusCanonical = normalizeDistrictKey(canonicalDistrictName(districtName))

	return (
		geo === focus ||
		canonical === focus ||
		canonical === focusCanonical ||
		geo.includes(focus) ||
		focus.includes(geo) ||
		(focus.includes('kamrup rural') && geo === 'kamrup') ||
		(focus.includes('south salmara') && geo.includes('salmara'))
	)
}

export const ASSAM_DISTRICTS_GEOJSON_URL = '/geo/assam-districts.geojson'

/** Approximate Assam view for Leaflet */
export const ASSAM_MAP_CENTER = [26.2, 92.9]
export const ASSAM_MAP_ZOOM = 8.2
