/**
 * Assam district / sub-district GeoJSON name ↔ portal district name matching.
 * Districts: frontend/public/geo/assam-districts.geojson (dissolved from LGD sub-districts).
 * Sub-districts (circles): frontend/public/geo/assam-subdistricts.geojson (LGD; prototype).
 */

const GEO_NAME_ALIASES = {
	kamrup: 'Kamrup Rural',
	'south salmara mankachar': 'South Salmara-Mankachar',
	'south salmara-mankachar': 'South Salmara-Mankachar',
	'south salmara mancachar': 'South Salmara-Mankachar',
	'kamrup metropolitan': 'Kamrup Metropolitan',
	'kamrup metro': 'Kamrup Metropolitan',
	'north cachar hills': 'Dima Hasao',
	'n c hills': 'Dima Hasao',
	'sibsagar': 'Sivasagar',
	marigaon: 'Morigaon',
	'east karbi anglong': 'Karbi Anglong',
	'karbi anglong east': 'Karbi Anglong',
}

export function normalizeDistrictKey(name) {
	return String(name || '')
		.toLowerCase()
		.replace(/[–—]/g, '-')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ')
}

export function normalizeCircleKey(name) {
	return normalizeDistrictKey(name)
		.replace(/\b(circle|office|co|pt)\b/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
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

/**
 * Build lookup of subdivision/circle stats keyed by normalized circle name.
 * Sources: district.subdivisions[] from dashboard stats (office-linked UIN counts).
 */
export function buildSubdivisionLookup(districts = []) {
	const byKey = new Map()
	districts.forEach((d) => {
		const list = Array.isArray(d?.subdivisions) ? d.subdivisions : []
		list.forEach((sub) => {
			const name = sub?.name || sub?.office_name
			if (!name) return
			const entry = {
				...sub,
				district_name: d.name,
				district_id: d.id,
				tenancy_applications: sub.tenancy_applications ?? 0,
				service_applications: sub.service_applications ?? 0,
				total_applications:
					sub.total_applications ??
					(sub.tenancy_applications ?? 0) + (sub.service_applications ?? 0),
			}
			const key = normalizeCircleKey(name)
			if (key) byKey.set(key, entry)
			if (sub.office_name) {
				const officeKey = normalizeCircleKey(sub.office_name)
				if (officeKey) byKey.set(officeKey, entry)
			}
		})
	})
	return byKey
}

export function findSubdivisionStats(featureOrName, lookup) {
	if (!lookup?.size) return null
	const raw =
		typeof featureOrName === 'string'
			? featureOrName
			: featureOrName?.properties?.subdistrict ||
				featureOrName?.properties?.sdtname ||
				featureOrName?.properties?.name ||
				''
	const key = normalizeCircleKey(raw)
	if (!key) return null
	if (lookup.has(key)) return lookup.get(key)

	for (const [candidate, stats] of lookup.entries()) {
		if (candidate.includes(key) || key.includes(candidate)) return stats
	}
	return null
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
export const ASSAM_SUBDISTRICTS_GEOJSON_URL = '/geo/assam-subdistricts.geojson'

/** Sub-district / circle name from a feature. */
export function subdistrictFeatureName(feature) {
	return (
		feature?.properties?.subdistrict ||
		feature?.properties?.sdtname ||
		feature?.properties?.name ||
		'Sub-division'
	)
}

/** Approximate Assam view for Leaflet */
export const ASSAM_MAP_CENTER = [26.2, 92.9]
export const ASSAM_MAP_ZOOM = 8.2
